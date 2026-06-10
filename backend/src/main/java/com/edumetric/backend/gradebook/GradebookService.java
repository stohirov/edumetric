package com.edumetric.backend.gradebook;

import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.gradebook.dto.GradebookCellDto;
import com.edumetric.backend.gradebook.dto.GradebookColumnDto;
import com.edumetric.backend.gradebook.dto.GradebookDto;
import com.edumetric.backend.gradebook.dto.GradebookRowDto;
import com.edumetric.backend.gradebook.dto.StudentCourseGradesDto;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.homework.HomeworkSubmissionRepository;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.settings.SettingsService;
import com.edumetric.backend.settings.domain.GradingScale;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-only assembly of the gradebook. It unifies the two ways a teacher
 * produces marks — direct {@link Grade}s and graded homework submissions, both
 * of which hang off the same {@link Assignment} — into a single matrix and one
 * weighted course grade per student. Writes still flow through the existing
 * {@code /api/grades} upsert, so this slice owns presentation, not mutation.
 */
@Service
@RequiredArgsConstructor
public class GradebookService {

    private static final double DEFAULT_WEIGHT = 1.0;

    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final GradeRepository gradeRepository;
    private final HomeworkSubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final TeacherScope teacherScope;
    private final SettingsService settingsService;

    /** The full matrix for a course, optionally narrowed to a single group. */
    @Transactional(readOnly = true)
    public GradebookDto gradebook(Long courseId, Long groupId, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, courseId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> ResourceNotFoundException.of("Course", courseId));
        GradingScale scale = settingsService.currentGradingScale();

        List<Assignment> assignments =
                assignmentRepository.findAllByCourseIdOrderByDueDateAscNameAsc(courseId);
        List<Student> students = studentRepository.findAllForCourse(courseId).stream()
                .filter(s -> groupId == null || groupId.equals(s.getGroup().getId()))
                .sorted(Comparator.comparing(
                        s -> s.getUser().getFullName(), String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<Long> assignmentIds = assignments.stream().map(Assignment::getId).toList();
        Map<Long, Map<Long, Grade>> gradesByStudent = gradesByStudent(assignmentIds);
        Map<Long, Set<Long>> submittedByStudent = submittedByStudent(assignmentIds);

        // Column accumulators: assignmentId -> [sumPercent, gradedCount].
        Map<Long, double[]> colStats = new HashMap<>();
        List<GradebookRowDto> rows = new ArrayList<>(students.size());

        for (Student student : students) {
            Map<Long, Grade> studentGrades = gradesByStudent.getOrDefault(student.getId(), Map.of());
            Set<Long> studentSubmitted = submittedByStudent.getOrDefault(student.getId(), Set.of());

            List<GradebookCellDto> cells = new ArrayList<>(assignments.size());
            double weighted = 0;
            double weightSum = 0;
            int graded = 0;

            for (Assignment a : assignments) {
                Grade grade = studentGrades.get(a.getId());
                if (grade != null) {
                    double pct = percent(grade.getValue(), a.getMaxValue());
                    cells.add(new GradebookCellDto(
                            a.getId(), grade.getId(), grade.getValue(), pct, false, grade.getComment()));
                    double w = weight(a);
                    weighted += pct * w;
                    weightSum += w;
                    graded++;
                    double[] acc = colStats.computeIfAbsent(a.getId(), k -> new double[2]);
                    acc[0] += pct;
                    acc[1]++;
                } else {
                    cells.add(GradebookCellDto.empty(a.getId(), studentSubmitted.contains(a.getId())));
                }
            }

            Double coursePercent = weightSum > 0 ? clamp(weighted / weightSum) : null;
            rows.add(new GradebookRowDto(
                    student.getId(),
                    student.getUser().getFullName(),
                    student.getGroup().getId(),
                    student.getGroup().getName(),
                    cells,
                    graded,
                    coursePercent,
                    GradeScale.display(coursePercent, scale)));
        }

        int studentCount = students.size();
        List<GradebookColumnDto> columns = assignments.stream()
                .map(a -> {
                    double[] acc = colStats.get(a.getId());
                    int gradedCount = acc == null ? 0 : (int) acc[1];
                    Double avg = (acc == null || acc[1] == 0) ? null : clamp(acc[0] / acc[1]);
                    return new GradebookColumnDto(
                            a.getId(), a.getName(), a.getType(), a.getMaxValue(), a.getWeight(),
                            a.getDueDate(), gradedCount, studentCount - gradedCount, avg);
                })
                .toList();

        return new GradebookDto(course.getId(), course.getName(), scale, columns, rows);
    }

    /** A single student's own standing in their course (no cohort data exposed). */
    @Transactional(readOnly = true)
    public StudentCourseGradesDto myGrades(AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        GradingScale scale = settingsService.currentGradingScale();

        if (student.getGroup() == null || student.getGroup().getCourse() == null) {
            return new StudentCourseGradesDto(null, null, scale, null, null, List.of());
        }
        Course course = student.getGroup().getCourse();

        List<Assignment> assignments =
                assignmentRepository.findAllByCourseIdOrderByDueDateAscNameAsc(course.getId());
        Map<Long, Grade> grades = new HashMap<>();
        for (Grade g : gradeRepository.findAllByStudentId(student.getId())) {
            grades.put(g.getAssignment().getId(), g);
        }
        Set<Long> submitted = new HashSet<>();
        for (var s : submissionRepository.findAllByStudentId(student.getId())) {
            submitted.add(s.getAssignment().getId());
        }

        List<StudentCourseGradesDto.Item> items = new ArrayList<>(assignments.size());
        double weighted = 0;
        double weightSum = 0;
        for (Assignment a : assignments) {
            Grade grade = grades.get(a.getId());
            if (grade != null) {
                double pct = percent(grade.getValue(), a.getMaxValue());
                double w = weight(a);
                weighted += pct * w;
                weightSum += w;
                items.add(new StudentCourseGradesDto.Item(
                        a.getId(), a.getName(), a.getType(), grade.getValue(), a.getMaxValue(),
                        a.getWeight(), pct, true, false, a.getDueDate(), grade.getGradedAt(),
                        grade.getComment()));
            } else {
                items.add(new StudentCourseGradesDto.Item(
                        a.getId(), a.getName(), a.getType(), null, a.getMaxValue(), a.getWeight(),
                        null, false, submitted.contains(a.getId()), a.getDueDate(), null, null));
            }
        }

        Double coursePercent = weightSum > 0 ? clamp(weighted / weightSum) : null;
        return new StudentCourseGradesDto(
                course.getId(), course.getName(), scale, coursePercent,
                GradeScale.display(coursePercent, scale), items);
    }

    private Map<Long, Map<Long, Grade>> gradesByStudent(List<Long> assignmentIds) {
        Map<Long, Map<Long, Grade>> byStudent = new HashMap<>();
        if (assignmentIds.isEmpty()) {
            return byStudent;
        }
        for (Grade g : gradeRepository.findAllByAssignmentIdIn(assignmentIds)) {
            byStudent.computeIfAbsent(g.getStudent().getId(), k -> new HashMap<>())
                    .put(g.getAssignment().getId(), g);
        }
        return byStudent;
    }

    private Map<Long, Set<Long>> submittedByStudent(List<Long> assignmentIds) {
        Map<Long, Set<Long>> byStudent = new HashMap<>();
        if (assignmentIds.isEmpty()) {
            return byStudent;
        }
        for (var s : submissionRepository.findAllByAssignmentIdIn(assignmentIds)) {
            byStudent.computeIfAbsent(s.getStudent().getId(), k -> new HashSet<>())
                    .add(s.getAssignment().getId());
        }
        return byStudent;
    }

    private static double percent(BigDecimal value, BigDecimal maxValue) {
        if (value == null || maxValue == null || maxValue.signum() <= 0) {
            return 0;
        }
        return clamp(value.doubleValue() / maxValue.doubleValue() * 100.0);
    }

    private static double weight(Assignment a) {
        return a.getWeight() == null ? DEFAULT_WEIGHT : Math.max(0, a.getWeight().doubleValue());
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(100, v));
    }
}
