package com.edumetric.backend.transcripts;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.gradebook.GradeScale;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.organization.AcademicTermRepository;
import com.edumetric.backend.organization.domain.AcademicTerm;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.settings.SettingsService;
import com.edumetric.backend.settings.domain.GradingScale;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.transcripts.domain.TermGrade;
import com.edumetric.backend.transcripts.dto.FinalizeRequest;
import com.edumetric.backend.transcripts.dto.TermGradeDto;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Finalizes per-term course grades and serves transcripts. The final percentage
 * is the same weighted course standing the live gradebook shows (sum of pct·weight
 * over the student's graded assignments, divided by total weight), snapshotted into
 * a {@link TermGrade} together with a derived letter and 4.0-scale GPA so the
 * transcript remains stable even if later grade edits move the live number.
 */
@Service
@RequiredArgsConstructor
public class TermGradeService {

    private static final double DEFAULT_WEIGHT = 1.0;

    private final TermGradeRepository termGradeRepository;
    private final AssignmentRepository assignmentRepository;
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final AcademicTermRepository academicTermRepository;
    private final SettingsService settingsService;
    private final TeacherScope teacherScope;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    /** Finalize one student (when {@code studentId} given) or the whole course roster. */
    @Transactional
    public List<TermGradeDto> finalize(FinalizeRequest request, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, request.courseId());

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        AcademicTerm term = academicTermRepository.findById(request.termId())
                .orElseThrow(() -> ResourceNotFoundException.of("AcademicTerm", request.termId()));
        GradingScale scale = settingsService.currentGradingScale();
        User finalizedBy = actor == null ? null : userRepository.findById(actor.id()).orElse(null);

        List<Student> targets;
        if (request.studentId() != null) {
            Student student = studentRepository.findById(request.studentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));
            targets = List.of(student);
        } else {
            targets = studentRepository.findAllForCourse(course.getId());
        }

        List<TermGradeDto> result = new ArrayList<>(targets.size());
        for (Student student : targets) {
            Double percent = computeCoursePercent(student.getId(), course.getId());
            BigDecimal finalPercent = percent == null
                    ? null
                    : BigDecimal.valueOf(percent).setScale(2, RoundingMode.HALF_UP);
            String letter = GradeScale.display(percent, scale);
            BigDecimal gpa = gpaFor(percent);

            TermGrade tg = termGradeRepository
                    .findByStudentIdAndCourseIdAndTermId(student.getId(), course.getId(), term.getId())
                    .orElseGet(() -> TermGrade.builder()
                            .student(student)
                            .course(course)
                            .term(term)
                            .build());
            tg.setFinalPercent(finalPercent);
            tg.setLetter(letter);
            tg.setGpa(gpa);
            tg.setFinalizedBy(finalizedBy);
            TermGrade saved = termGradeRepository.save(tg);

            auditLogService.log("TermGrade", saved.getId(), "TERM_GRADE_FINALIZE",
                    actor == null ? null : actor.id(),
                    Map.of(
                            "studentId", student.getId(),
                            "courseId", course.getId(),
                            "termId", term.getId(),
                            "finalPercent", finalPercent == null ? "null" : finalPercent.toString(),
                            "letter", letter == null ? "null" : letter,
                            "gpa", gpa.toString()));

            result.add(TermGradeDto.from(saved));
        }
        return result;
    }

    /** A student's full transcript (teacher/admin view), newest first. */
    @Transactional(readOnly = true)
    public List<TermGradeDto> transcript(Long studentId, AuthenticatedUser actor) {
        teacherScope.assertCanWriteFor(actor, studentId);
        return termGradeRepository.findAllByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(TermGradeDto::from)
                .toList();
    }

    /** The signed-in student's own transcript, newest first. */
    @Transactional(readOnly = true)
    public List<TermGradeDto> myTranscript(AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        return termGradeRepository.findAllByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(TermGradeDto::from)
                .toList();
    }

    /**
     * The student's weighted course percentage: for each assignment in the course
     * the student has a grade on, pct = value/maxValue·100 clamped to 0–100, weighted
     * by the assignment weight (default 1). Returns sum(pct·w)/sum(w), or null when the
     * student has no grades. Mirrors {@code GradebookService}'s computation exactly.
     */
    private Double computeCoursePercent(Long studentId, Long courseId) {
        List<Assignment> assignments = assignmentRepository.findAllByCourseId(courseId);
        if (assignments.isEmpty()) {
            return null;
        }
        Map<Long, Grade> grades = new HashMap<>();
        for (Grade g : gradeRepository.findAllByStudentId(studentId)) {
            grades.put(g.getAssignment().getId(), g);
        }

        double weighted = 0;
        double weightSum = 0;
        for (Assignment a : assignments) {
            Grade grade = grades.get(a.getId());
            if (grade == null) {
                continue;
            }
            double pct = percent(grade.getValue(), a.getMaxValue());
            double w = weight(a);
            weighted += pct * w;
            weightSum += w;
        }
        return weightSum > 0 ? clamp(weighted / weightSum) : null;
    }

    /** Simple 4.0-scale mapping from a percentage; 0.0 when ungraded. */
    private static BigDecimal gpaFor(Double percent) {
        double gpa;
        if (percent == null) {
            gpa = 0.0;
        } else if (percent >= 90) {
            gpa = 4.0;
        } else if (percent >= 80) {
            gpa = 3.0;
        } else if (percent >= 70) {
            gpa = 2.0;
        } else if (percent >= 60) {
            gpa = 1.0;
        } else {
            gpa = 0.0;
        }
        return BigDecimal.valueOf(gpa).setScale(2, RoundingMode.HALF_UP);
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
