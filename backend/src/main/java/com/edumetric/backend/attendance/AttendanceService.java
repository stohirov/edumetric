package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.attendance.dto.BulkAttendanceRequest;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.lessons.domain.Lesson;
import com.edumetric.backend.metrics.MetricsService;
import com.edumetric.backend.notifications.NotificationService;
import com.edumetric.backend.notifications.domain.NotificationType;
import com.edumetric.backend.parents.ParentLinkRepository;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final TeacherScope teacherScope;
    private final MetricsService metricsService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final ParentLinkRepository parentLinkRepository;
    private final AttendancePolicyService attendancePolicyService;

    @Transactional(readOnly = true)
    public List<AttendanceDto> forLesson(Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            throw ResourceNotFoundException.of("Lesson", lessonId);
        }
        return attendanceRepository.findAllByLessonId(lessonId).stream()
                .map(AttendanceDto::from)
                .toList();
    }

    @Transactional
    public Set<Long> bulkUpsert(BulkAttendanceRequest request, AuthenticatedUser actor) {
        Lesson lesson = lessonRepository.findById(request.lessonId())
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", request.lessonId()));
        User marker = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));

        Set<Long> affectedStudentIds = new HashSet<>();
        List<Student> newlyAbsent = new ArrayList<>();
        Instant now = Instant.now();

        for (BulkAttendanceRequest.Entry entry : request.entries()) {
            teacherScope.assertCanWriteFor(actor, entry.studentId());
            Student student = studentRepository.findById(entry.studentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Student", entry.studentId()));

            Attendance attendance = attendanceRepository
                    .findByStudentIdAndLessonId(student.getId(), lesson.getId())
                    .orElseGet(() -> Attendance.builder()
                            .student(student)
                            .lesson(lesson)
                            .markedAt(now)
                            .build());

            boolean wasAbsent = attendance.getStatus() == AttendanceStatus.ABSENT;
            attendance.setStatus(entry.status());
            attendance.setComment(entry.comment());
            attendance.setMarkedBy(marker);
            attendance.setMarkedAt(now);
            attendanceRepository.save(attendance);
            affectedStudentIds.add(student.getId());
            if (entry.status() == AttendanceStatus.ABSENT && !wasAbsent) {
                newlyAbsent.add(student);
            }
        }
        metricsService.recomputeAll(affectedStudentIds);
        notifyAbsences(lesson, newlyAbsent);
        auditLogService.log("Attendance", lesson.getId(), "ATTENDANCE_BULK_UPSERT", actor.id(),
                java.util.Map.of(
                        "lessonId", lesson.getId(),
                        "affectedStudents", affectedStudentIds.size()));
        return affectedStudentIds;
    }

    /**
     * Quick-marks a whole lesson roster (the lesson's group) to a single status. When
     * {@code onlyUnmarked} is true, students who already have an attendance row are left
     * untouched — the "default everyone present, then adjust" workflow.
     */
    @Transactional
    public Set<Long> markAll(
            Long lessonId, AttendanceStatus status, boolean onlyUnmarked, AuthenticatedUser actor) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", lessonId));
        User marker = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));
        List<Student> roster = studentRepository
                .findAllByGroupId(lesson.getGroup().getId(), Pageable.unpaged()).getContent();

        Set<Long> affected = new HashSet<>();
        List<Student> newlyAbsent = new ArrayList<>();
        Instant now = Instant.now();
        for (Student student : roster) {
            teacherScope.assertCanWriteFor(actor, student.getId());
            var existing = attendanceRepository.findByStudentIdAndLessonId(student.getId(), lesson.getId());
            if (onlyUnmarked && existing.isPresent()) {
                continue;
            }
            Attendance attendance = existing.orElseGet(() -> Attendance.builder()
                    .student(student)
                    .lesson(lesson)
                    .markedAt(now)
                    .build());
            boolean wasAbsent = attendance.getStatus() == AttendanceStatus.ABSENT;
            attendance.setStatus(status);
            attendance.setMarkedBy(marker);
            attendance.setMarkedAt(now);
            attendanceRepository.save(attendance);
            affected.add(student.getId());
            if (status == AttendanceStatus.ABSENT && !wasAbsent) {
                newlyAbsent.add(student);
            }
        }
        metricsService.recomputeAll(affected);
        notifyAbsences(lesson, newlyAbsent);
        auditLogService.log("Attendance", lesson.getId(), "ATTENDANCE_MARK_ALL", actor.id(),
                java.util.Map.of("lessonId", lesson.getId(), "status", status.name(),
                        "affectedStudents", affected.size()));
        return affected;
    }

    /** Notifies newly-absent students (and their linked parents), gated by the attendance policy. */
    private void notifyAbsences(Lesson lesson, List<Student> absentStudents) {
        if (absentStudents.isEmpty() || !attendancePolicyService.current().isNotifyOnAbsence()) {
            return;
        }
        String body = "You were marked absent for " + lesson.getTopic();
        for (Student student : absentStudents) {
            Set<Long> recipients = new HashSet<>();
            if (student.getUser() != null) {
                recipients.add(student.getUser().getId());
            }
            for (var link : parentLinkRepository.findAllByStudentId(student.getId())) {
                if (link.getParent() != null) {
                    recipients.add(link.getParent().getId());
                }
            }
            notificationService.notifyUsers(
                    recipients, NotificationType.ABSENCE_MARKED, "Absence recorded", body,
                    "/student/attendance");
        }
    }
}
