package com.edumetric.backend.justifications;

import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.justifications.domain.AbsenceJustification;
import com.edumetric.backend.justifications.domain.JustificationStatus;
import com.edumetric.backend.justifications.dto.CreateJustificationRequest;
import com.edumetric.backend.justifications.dto.DecisionRequest;
import com.edumetric.backend.justifications.dto.JustificationDto;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.lessons.domain.Lesson;
import com.edumetric.backend.metrics.MetricsService;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AbsenceJustificationService {

    private final AbsenceJustificationRepository justificationRepository;
    private final LessonRepository lessonRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final MetricsService metricsService;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    /** Student submits an excuse for a lesson they missed. */
    @Transactional
    public JustificationDto submit(CreateJustificationRequest request, AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        Lesson lesson = lessonRepository.findById(request.lessonId())
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", request.lessonId()));

        if (justificationRepository.existsByStudentIdAndLessonId(student.getId(), lesson.getId())) {
            throw new ConflictException(
                    "A justification already exists for this lesson");
        }

        AbsenceJustification justification = justificationRepository.save(AbsenceJustification.builder()
                .student(student)
                .lesson(lesson)
                .reason(request.reason())
                .status(JustificationStatus.PENDING)
                .createdAt(Instant.now())
                .build());

        auditLogService.log("AbsenceJustification", justification.getId(), "JUSTIFICATION_SUBMIT",
                actor.id(), Map.of("lessonId", lesson.getId(), "studentId", student.getId()));
        return JustificationDto.from(justification);
    }

    /** The submitting student's own justification history, newest first. */
    @Transactional(readOnly = true)
    public Page<JustificationDto> myJustifications(AuthenticatedUser actor, Pageable pageable) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        return justificationRepository
                .findAllByStudentIdOrderByCreatedAtDesc(student.getId(), pageable)
                .map(JustificationDto::from);
    }

    /**
     * Pending justifications awaiting a decision. Admins see all; teachers see only those whose
     * lesson belongs to a course they teach (scope pushed into the query).
     */
    @Transactional(readOnly = true)
    public Page<JustificationDto> pending(AuthenticatedUser actor, Pageable pageable) {
        if (actor.role() == Role.ADMIN) {
            return justificationRepository
                    .findAllByStatusOrderByCreatedAtDesc(JustificationStatus.PENDING, pageable)
                    .map(JustificationDto::from);
        }
        List<Long> courseIds = lessonRepository.findCourseIdsForTeacherUser(actor.id());
        if (courseIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return justificationRepository
                .findAllByCourseIdsAndStatus(courseIds, JustificationStatus.PENDING, pageable)
                .map(JustificationDto::from);
    }

    /**
     * Approves a justification: marks it APPROVED and upserts the student's attendance for that
     * lesson to EXCUSED, then recomputes the student's metrics.
     */
    @Transactional
    public JustificationDto approve(Long id, AuthenticatedUser actor) {
        AbsenceJustification justification = justificationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("AbsenceJustification", id));
        teacherScope.assertTeachesCourse(actor, justification.getLesson().getCourse().getId());
        if (justification.getStatus() != JustificationStatus.PENDING) {
            throw new ConflictException("Justification is not pending and cannot be approved");
        }

        User decider = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));
        Instant now = Instant.now();

        justification.setStatus(JustificationStatus.APPROVED);
        justification.setDecidedBy(decider);
        justification.setDecidedAt(now);

        Student student = justification.getStudent();
        Lesson lesson = justification.getLesson();
        Attendance attendance = attendanceRepository
                .findByStudentIdAndLessonId(student.getId(), lesson.getId())
                .orElseGet(() -> Attendance.builder()
                        .student(student)
                        .lesson(lesson)
                        .build());
        attendance.setStatus(AttendanceStatus.EXCUSED);
        attendance.setMarkedBy(decider);
        attendance.setMarkedAt(now);
        attendance.setComment(justification.getReason());
        attendanceRepository.save(attendance);

        metricsService.recomputeAll(Set.of(student.getId()));

        auditLogService.log("AbsenceJustification", justification.getId(), "JUSTIFICATION_APPROVE",
                actor.id(), Map.of("lessonId", lesson.getId(), "studentId", student.getId()));
        return JustificationDto.from(justification);
    }

    /** Rejects a justification without touching attendance. */
    @Transactional
    public JustificationDto reject(Long id, DecisionRequest request, AuthenticatedUser actor) {
        AbsenceJustification justification = justificationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("AbsenceJustification", id));
        teacherScope.assertTeachesCourse(actor, justification.getLesson().getCourse().getId());
        if (justification.getStatus() != JustificationStatus.PENDING) {
            throw new ConflictException("Justification is not pending and cannot be rejected");
        }

        User decider = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));

        justification.setStatus(JustificationStatus.REJECTED);
        justification.setDecidedBy(decider);
        justification.setDecidedAt(Instant.now());

        auditLogService.log("AbsenceJustification", justification.getId(), "JUSTIFICATION_REJECT",
                actor.id(), Map.of(
                        "lessonId", justification.getLesson().getId(),
                        "studentId", justification.getStudent().getId(),
                        "note", request != null && request.note() != null ? request.note() : ""));
        return JustificationDto.from(justification);
    }
}
