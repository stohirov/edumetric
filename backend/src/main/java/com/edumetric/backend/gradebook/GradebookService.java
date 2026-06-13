package com.edumetric.backend.gradebook;

import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.gradebook.dto.GradebookCellDto;
import com.edumetric.backend.gradebook.dto.GradebookColumnDto;
import com.edumetric.backend.gradebook.dto.GradebookColumnKind;
import com.edumetric.backend.gradebook.dto.GradebookDto;
import com.edumetric.backend.gradebook.dto.GradebookRowDto;
import com.edumetric.backend.gradebook.dto.StudentCourseGradesDto;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.AssignmentType;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.quizzes.QuizQuestionRepository;
import com.edumetric.backend.quizzes.QuizRepository;
import com.edumetric.backend.quizzes.domain.Quiz;
import com.edumetric.backend.quizzes.domain.QuizQuestion;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.settings.SettingsService;
import com.edumetric.backend.settings.domain.GradingScale;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.submissions.SubmissionRepository;
import com.edumetric.backend.submissions.domain.Submission;
import com.edumetric.backend.submissions.domain.SubmissionKind;
import java.math.BigDecimal;
import java.time.LocalDate;
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
 * Read-only assembly of the gradebook. It unifies every way a course produces a
 * mark into a single matrix and one weighted course grade per student:
 * <ul>
 *   <li>direct {@link Grade}s and graded homework submissions, both hanging off
 *       the same {@link Assignment}; and</li>
 *   <li>auto-graded {@link QuizAttempt}s, folded in as read-only columns scored
 *       from each student's best attempt.</li>
 * </ul>
 * Writes still flow through the existing {@code /api/grades} upsert (assignments)
 * and the quiz-taking surface (quizzes), so this slice owns presentation, not
 * mutation. Quizzes carry a default weight of 1.0 (they have no explicit weight).
 */
@Service
@RequiredArgsConstructor
public class GradebookService {

    private static final double DEFAULT_WEIGHT = 1.0;

    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final GradeRepository gradeRepository;
    private final SubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
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
        List<Quiz> quizzes = publishedQuizzes(courseId);
        List<Student> students = studentRepository.findAllForCourse(courseId).stream()
                .filter(s -> groupId == null || groupId.equals(s.getGroup().getId()))
                .sorted(Comparator.comparing(
                        s -> s.getUser().getFullName(), String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<Long> assignmentIds = assignments.stream().map(Assignment::getId).toList();
        List<Long> quizIds = quizzes.stream().map(Quiz::getId).toList();
        Map<Long, Map<Long, Grade>> gradesByStudent = gradesByStudent(assignmentIds);
        Map<Long, Set<Long>> submittedByStudent = submittedByStudent(assignmentIds);
        Map<Long, BigDecimal> quizMaxPoints = quizMaxPoints(quizIds);
        Map<Long, Map<Long, Submission>> quizMarksByStudent = quizMarksByStudent(quizIds);

        List<ColumnSpec> specs = buildSpecs(assignments, quizzes, quizMaxPoints);

        // Column accumulators keyed by column key: [sumPercent, gradedCount].
        Map<String, double[]> colStats = new HashMap<>();
        List<GradebookRowDto> rows = new ArrayList<>(students.size());

        for (Student student : students) {
            Map<Long, Grade> studentGrades = gradesByStudent.getOrDefault(student.getId(), Map.of());
            Set<Long> studentSubmitted = submittedByStudent.getOrDefault(student.getId(), Set.of());
            Map<Long, Submission> studentQuizMarks =
                    quizMarksByStudent.getOrDefault(student.getId(), Map.of());

            List<GradebookCellDto> cells = new ArrayList<>(specs.size());
            double weighted = 0;
            double weightSum = 0;
            int graded = 0;

            for (ColumnSpec spec : specs) {
                if (spec.kind() == GradebookColumnKind.QUIZ) {
                    Submission mark = studentQuizMarks.get(spec.quizId());
                    if (mark != null && mark.getScore() != null) {
                        double pct = percent(mark.getScore(), mark.getMaxScore());
                        cells.add(GradebookCellDto.quiz(spec.key(), spec.quizId(), mark.getScore(), pct));
                        weighted += pct * spec.weightValue();
                        weightSum += spec.weightValue();
                        graded++;
                        accumulate(colStats, spec.key(), pct);
                    } else {
                        cells.add(GradebookCellDto.empty(spec.key(), null, spec.quizId(), false));
                    }
                } else {
                    Grade grade = studentGrades.get(spec.assignmentId());
                    if (grade != null) {
                        double pct = percent(grade.getValue(), spec.maxValue());
                        cells.add(GradebookCellDto.graded(
                                spec.key(), spec.assignmentId(), grade.getId(),
                                grade.getValue(), pct, grade.getComment()));
                        weighted += pct * spec.weightValue();
                        weightSum += spec.weightValue();
                        graded++;
                        accumulate(colStats, spec.key(), pct);
                    } else {
                        cells.add(GradebookCellDto.empty(
                                spec.key(), spec.assignmentId(), null,
                                studentSubmitted.contains(spec.assignmentId())));
                    }
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
        List<GradebookColumnDto> columns = specs.stream()
                .map(spec -> {
                    double[] acc = colStats.get(spec.key());
                    int gradedCount = acc == null ? 0 : (int) acc[1];
                    Double avg = (acc == null || acc[1] == 0) ? null : clamp(acc[0] / acc[1]);
                    return new GradebookColumnDto(
                            spec.key(), spec.kind(), spec.assignmentId(), spec.quizId(),
                            spec.name(), spec.type(), spec.maxValue(), spec.weight(),
                            spec.dueDate(), gradedCount, studentCount - gradedCount, avg);
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
        List<Quiz> quizzes = publishedQuizzes(course.getId());

        Map<Long, Grade> grades = new HashMap<>();
        for (Grade g : gradeRepository.findAllByStudentId(student.getId())) {
            grades.put(g.getAssignment().getId(), g);
        }
        // One read of the unified table covers both homework "submitted" state and quiz marks.
        Set<Long> submitted = new HashSet<>();
        Map<Long, Submission> quizMarks = new HashMap<>();
        for (Submission s : submissionRepository.findAllByStudentIdOrderBySubmittedAtDesc(student.getId())) {
            if (s.getKind() == SubmissionKind.HOMEWORK && s.getAssignment() != null) {
                submitted.add(s.getAssignment().getId());
            } else if (s.getKind() == SubmissionKind.QUIZ && s.getQuiz() != null) {
                quizMarks.put(s.getQuiz().getId(), s);
            }
        }
        Map<Long, BigDecimal> quizMaxPoints =
                quizMaxPoints(quizzes.stream().map(Quiz::getId).toList());

        List<StudentCourseGradesDto.Item> items =
                new ArrayList<>(assignments.size() + quizzes.size());
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
                        "a-" + a.getId(), a.getId(), null, a.getName(), a.getType(),
                        grade.getValue(), a.getMaxValue(), a.getWeight(), pct, true, false,
                        a.getDueDate(), grade.getGradedAt(), grade.getComment()));
            } else {
                items.add(new StudentCourseGradesDto.Item(
                        "a-" + a.getId(), a.getId(), null, a.getName(), a.getType(),
                        null, a.getMaxValue(), a.getWeight(), null, false,
                        submitted.contains(a.getId()), a.getDueDate(), null, null));
            }
        }

        for (Quiz q : quizzes) {
            Submission mark = quizMarks.get(q.getId());
            if (mark != null && mark.getScore() != null) {
                double pct = percent(mark.getScore(), mark.getMaxScore());
                weighted += pct * DEFAULT_WEIGHT;
                weightSum += DEFAULT_WEIGHT;
                BigDecimal max = mark.getMaxScore() != null
                        ? mark.getMaxScore() : quizMaxPoints.get(q.getId());
                items.add(new StudentCourseGradesDto.Item(
                        "q-" + q.getId(), null, q.getId(), q.getTitle(), null,
                        mark.getScore(), max, BigDecimal.ONE, pct, true, false,
                        null, mark.getGradedAt(), null));
            } else {
                items.add(new StudentCourseGradesDto.Item(
                        "q-" + q.getId(), null, q.getId(), q.getTitle(), null,
                        null, quizMaxPoints.get(q.getId()), BigDecimal.ONE, null, false, false,
                        null, null, null));
            }
        }

        Double coursePercent = weightSum > 0 ? clamp(weighted / weightSum) : null;
        return new StudentCourseGradesDto(
                course.getId(), course.getName(), scale, coursePercent,
                GradeScale.display(coursePercent, scale), items);
    }

    /** Published quizzes for a course, ordered by title for a stable matrix layout. */
    private List<Quiz> publishedQuizzes(Long courseId) {
        return quizRepository.findAllByCourseIdAndPublishedTrueOrderByIdDesc(courseId).stream()
                .sorted(Comparator.comparing(Quiz::getTitle, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    /** Total max points per quiz (sum of question points), keyed by quiz id. */
    private Map<Long, BigDecimal> quizMaxPoints(List<Long> quizIds) {
        Map<Long, BigDecimal> max = new HashMap<>();
        if (quizIds.isEmpty()) {
            return max;
        }
        for (QuizQuestion q : quizQuestionRepository.findAllByQuizIdIn(quizIds)) {
            BigDecimal pts = q.getPoints() == null ? BigDecimal.ZERO : q.getPoints();
            max.merge(q.getQuiz().getId(), pts, BigDecimal::add);
        }
        return max;
    }

    /**
     * Quiz marks per (student, quiz) read straight from the unified submission
     * table — each row already holds the student's best attempt, so no
     * best-of computation is needed here (it happens once, on write).
     */
    private Map<Long, Map<Long, Submission>> quizMarksByStudent(List<Long> quizIds) {
        Map<Long, Map<Long, Submission>> byStudent = new HashMap<>();
        if (quizIds.isEmpty()) {
            return byStudent;
        }
        for (Submission s : submissionRepository.findAllByQuizIdIn(quizIds)) {
            byStudent.computeIfAbsent(s.getStudent().getId(), k -> new HashMap<>())
                    .put(s.getQuiz().getId(), s);
        }
        return byStudent;
    }

    private List<ColumnSpec> buildSpecs(
            List<Assignment> assignments, List<Quiz> quizzes, Map<Long, BigDecimal> quizMaxPoints) {
        List<ColumnSpec> specs = new ArrayList<>(assignments.size() + quizzes.size());
        for (Assignment a : assignments) {
            specs.add(new ColumnSpec(
                    "a-" + a.getId(), GradebookColumnKind.ASSIGNMENT, a.getId(), null,
                    a.getName(), a.getType(), a.getMaxValue(), a.getWeight(), weight(a), a.getDueDate()));
        }
        for (Quiz q : quizzes) {
            specs.add(new ColumnSpec(
                    "q-" + q.getId(), GradebookColumnKind.QUIZ, null, q.getId(),
                    q.getTitle(), null, quizMaxPoints.get(q.getId()), BigDecimal.ONE, DEFAULT_WEIGHT, null));
        }
        return specs;
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

    private static void accumulate(Map<String, double[]> colStats, String key, double pct) {
        double[] acc = colStats.computeIfAbsent(key, k -> new double[2]);
        acc[0] += pct;
        acc[1]++;
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

    /**
     * Internal description of one gradebook column (assignment or quiz), unifying
     * the two sources so the matrix can be built in a single pass. {@code weight}
     * is the value shown to the teacher (nullable for assignments); {@code
     * weightValue} is the defaulted weight used in the course-grade math.
     */
    private record ColumnSpec(
            String key,
            GradebookColumnKind kind,
            Long assignmentId,
            Long quizId,
            String name,
            AssignmentType type,
            BigDecimal maxValue,
            BigDecimal weight,
            double weightValue,
            LocalDate dueDate) {
    }
}
