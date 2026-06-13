package com.edumetric.backend.grades;

import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.grades.dto.BulkGradeRequest;
import com.edumetric.backend.grades.dto.CreateGradeRequest;
import com.edumetric.backend.grades.dto.GradeDto;
import com.edumetric.backend.grades.dto.UpdateGradeRequest;
import com.edumetric.backend.metrics.MetricsService;
import com.edumetric.backend.notifications.NotificationService;
import com.edumetric.backend.notifications.domain.NotificationType;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.submissions.SubmissionService;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final TeacherScope teacherScope;
    private final MetricsService metricsService;
    private final NotificationService notificationService;
    private final SubmissionService submissionService;

    @Transactional
    public GradeDto create(CreateGradeRequest request, AuthenticatedUser actor) {
        teacherScope.assertCanWriteFor(actor, request.studentId());
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", request.assignmentId()));
        assertValueWithinBounds(request.value(), assignment);
        User grader = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));

        Grade grade = gradeRepository
                .findByStudentIdAndAssignmentId(student.getId(), assignment.getId())
                .orElseGet(() -> Grade.builder()
                        .student(student)
                        .assignment(assignment)
                        .build());
        grade.setValue(request.value());
        grade.setComment(request.comment());
        grade.setGradedBy(grader);
        grade.setGradedAt(Instant.now());
        Grade saved = gradeRepository.save(grade);
        submissionService.markGraded(student.getId(), assignment, grade.getValue(), grade.getGradedAt());
        metricsService.recompute(student.getId());
        notificationService.notifyUser(
                student.getUser().getId(),
                NotificationType.GRADE_POSTED,
                "New grade posted",
                assignment.getName() + ": " + request.value(),
                "/student/grades");
        return GradeDto.from(saved);
    }

    @Transactional
    public Set<Long> bulk(BulkGradeRequest request, AuthenticatedUser actor) {
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", request.assignmentId()));
        User grader = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));

        Set<Long> affectedStudentIds = new HashSet<>();
        Set<Long> notifyUserIds = new HashSet<>();
        Instant now = Instant.now();
        for (BulkGradeRequest.Entry entry : request.entries()) {
            teacherScope.assertCanWriteFor(actor, entry.studentId());
            assertValueWithinBounds(entry.value(), assignment);
            Student student = studentRepository.findById(entry.studentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Student", entry.studentId()));
            Grade grade = gradeRepository
                    .findByStudentIdAndAssignmentId(student.getId(), assignment.getId())
                    .orElseGet(() -> Grade.builder()
                            .student(student)
                            .assignment(assignment)
                            .build());
            grade.setValue(entry.value());
            grade.setComment(entry.comment());
            grade.setGradedBy(grader);
            grade.setGradedAt(now);
            gradeRepository.save(grade);
            submissionService.markGraded(student.getId(), assignment, entry.value(), now);
            affectedStudentIds.add(student.getId());
            notifyUserIds.add(student.getUser().getId());
        }
        metricsService.recomputeAll(affectedStudentIds);
        notificationService.notifyUsers(
                notifyUserIds,
                NotificationType.GRADE_POSTED,
                "New grade posted",
                "Grades posted for " + assignment.getName(),
                "/student/grades");
        return affectedStudentIds;
    }

    @Transactional
    public GradeDto update(Long id, UpdateGradeRequest request, AuthenticatedUser actor) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Grade", id));
        teacherScope.assertCanWriteFor(actor, grade.getStudent().getId());
        if (request.value() != null) {
            assertValueWithinBounds(request.value(), grade.getAssignment());
            grade.setValue(request.value());
        }
        if (request.comment() != null) {
            grade.setComment(request.comment());
        }
        User grader = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));
        grade.setGradedBy(grader);
        grade.setGradedAt(Instant.now());
        submissionService.markGraded(
                grade.getStudent().getId(), grade.getAssignment(), grade.getValue(), grade.getGradedAt());
        metricsService.recompute(grade.getStudent().getId());
        return GradeDto.from(grade);
    }

    @Transactional
    public Long delete(Long id, AuthenticatedUser actor) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Grade", id));
        Long studentId = grade.getStudent().getId();
        Long assignmentId = grade.getAssignment().getId();
        teacherScope.assertCanWriteFor(actor, studentId);
        gradeRepository.delete(grade);
        gradeRepository.flush();
        submissionService.markUngraded(studentId, assignmentId);
        metricsService.recompute(studentId);
        return studentId;
    }

    private static void assertValueWithinBounds(BigDecimal value, Assignment assignment) {
        if (value.compareTo(assignment.getMaxValue()) > 0) {
            throw new BadRequestException(
                    "Grade value " + value + " exceeds assignment max " + assignment.getMaxValue());
        }
    }
}
