package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.attendance.dto.BulkAttendanceRequest;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.lessons.domain.Lesson;
import com.edumetric.backend.metrics.MetricsService;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
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

            attendance.setStatus(entry.status());
            attendance.setComment(entry.comment());
            attendance.setMarkedBy(marker);
            attendance.setMarkedAt(now);
            attendanceRepository.save(attendance);
            affectedStudentIds.add(student.getId());
        }
        metricsService.recomputeAll(affectedStudentIds);
        auditLogService.log("Attendance", lesson.getId(), "ATTENDANCE_BULK_UPSERT", actor.id(),
                java.util.Map.of(
                        "lessonId", lesson.getId(),
                        "affectedStudents", affectedStudentIds.size()));
        return affectedStudentIds;
    }
}
