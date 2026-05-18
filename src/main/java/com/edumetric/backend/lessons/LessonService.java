package com.edumetric.backend.lessons;

import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.lessons.dto.LessonDto;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.teachers.domain.Teacher;
import com.edumetric.backend.users.domain.Role;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public List<LessonDto> today(AuthenticatedUser caller) {
        if (caller.role() != Role.TEACHER && caller.role() != Role.ADMIN) {
            throw new ForbiddenException("Only teachers and admins can list today's lessons");
        }
        Teacher teacher = teacherRepository.findByUserId(caller.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher (for user)", caller.id()));

        OffsetDateTime startOfDay = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfDay = startOfDay.plusDays(1);
        return lessonRepository
                .findAllByTeacherIdAndScheduledAtBetweenOrderByScheduledAt(teacher.getId(), startOfDay, endOfDay)
                .stream()
                .map(LessonDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public LessonDto get(Long id) {
        return lessonRepository.findById(id).map(LessonDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", id));
    }
}
