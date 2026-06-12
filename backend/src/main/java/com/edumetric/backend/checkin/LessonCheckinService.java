package com.edumetric.backend.checkin;

import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.checkin.domain.LessonCheckin;
import com.edumetric.backend.checkin.dto.LessonCheckinDto;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.lessons.domain.Lesson;
import com.edumetric.backend.metrics.MetricsService;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LessonCheckinService {

    private static final String CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;
    private static final Duration CHECKIN_TTL = Duration.ofHours(3);

    private final SecureRandom secureRandom = new SecureRandom();

    private final LessonCheckinRepository checkinRepository;
    private final LessonRepository lessonRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final MetricsService metricsService;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    @Transactional
    public LessonCheckinDto open(Long lessonId, AuthenticatedUser actor) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", lessonId));
        teacherScope.assertTeachesCourse(actor, lesson.getCourse().getId());

        LessonCheckin checkin = checkinRepository.findByLessonId(lessonId)
                .orElseGet(() -> LessonCheckin.builder()
                        .lesson(lesson)
                        .createdAt(Instant.now())
                        .build());

        Instant now = Instant.now();
        checkin.setCode(generateUniqueCode());
        checkin.setOpen(true);
        checkin.setOpenedAt(now);
        checkin.setExpiresAt(now.plus(CHECKIN_TTL));
        LessonCheckin saved = checkinRepository.save(checkin);

        auditLogService.log("LessonCheckin", saved.getId(), "CHECKIN_OPEN", actor.id(), lessonId);
        return LessonCheckinDto.from(saved);
    }

    @Transactional
    public LessonCheckinDto close(Long lessonId, AuthenticatedUser actor) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", lessonId));
        teacherScope.assertTeachesCourse(actor, lesson.getCourse().getId());

        LessonCheckin checkin = checkinRepository.findByLessonId(lessonId)
                .orElseThrow(() -> ResourceNotFoundException.of("LessonCheckin", lessonId));
        checkin.setOpen(false);
        LessonCheckin saved = checkinRepository.save(checkin);

        auditLogService.log("LessonCheckin", saved.getId(), "CHECKIN_CLOSE", actor.id(), lessonId);
        return LessonCheckinDto.from(saved);
    }

    @Transactional(readOnly = true)
    public LessonCheckinDto status(Long lessonId, AuthenticatedUser actor) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", lessonId));
        teacherScope.assertTeachesCourse(actor, lesson.getCourse().getId());

        return checkinRepository.findByLessonId(lessonId)
                .map(LessonCheckinDto::from)
                .orElseGet(() -> new LessonCheckinDto(lessonId, null, false, null, null));
    }

    @Transactional
    public AttendanceDto submit(String code, AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student for user", actor.id()));

        LessonCheckin checkin = checkinRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Invalid check-in code"));

        if (!checkin.isOpen()) {
            throw new BadRequestException("Check-in is closed");
        }
        if (checkin.getExpiresAt() != null && !checkin.getExpiresAt().isAfter(Instant.now())) {
            throw new BadRequestException("Check-in has expired");
        }

        Lesson lesson = checkin.getLesson();
        Long lessonGroupId = lesson.getGroup() != null ? lesson.getGroup().getId() : null;
        Long studentGroupId = student.getGroup() != null ? student.getGroup().getId() : null;
        if (lessonGroupId == null || !lessonGroupId.equals(studentGroupId)) {
            throw new ForbiddenException("Not enrolled in this lesson");
        }

        Instant now = Instant.now();
        Attendance attendance = attendanceRepository
                .findByStudentIdAndLessonId(student.getId(), lesson.getId())
                .orElseGet(() -> Attendance.builder()
                        .student(student)
                        .lesson(lesson)
                        .build());
        attendance.setStatus(AttendanceStatus.PRESENT);
        attendance.setMarkedBy(student.getUser());
        attendance.setMarkedAt(now);
        Attendance saved = attendanceRepository.save(attendance);

        metricsService.recomputeAll(Set.of(student.getId()));
        auditLogService.log("LessonCheckin", checkin.getId(), "CHECKIN_SUBMIT", actor.id(), lesson.getId());
        return AttendanceDto.from(saved);
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_ALPHABET.charAt(secureRandom.nextInt(CODE_ALPHABET.length())));
            }
            code = sb.toString();
        } while (checkinRepository.findByCode(code).isPresent());
        return code;
    }
}
