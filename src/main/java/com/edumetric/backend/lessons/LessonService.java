package com.edumetric.backend.lessons;

import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.lessons.domain.Lesson;
import com.edumetric.backend.lessons.dto.CreateLessonRequest;
import com.edumetric.backend.lessons.dto.LessonDto;
import com.edumetric.backend.lessons.dto.UpdateLessonRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.teachers.domain.Teacher;
import com.edumetric.backend.users.domain.Role;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final TeacherRepository teacherRepository;
    private final GroupRepository groupRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public Page<LessonDto> list(Pageable pageable) {
        return lessonRepository.findAll(pageable).map(LessonDto::from);
    }

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

    @Transactional
    public LessonDto create(CreateLessonRequest request) {
        Group group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> ResourceNotFoundException.of("Group", request.groupId()));
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        Teacher teacher = teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher", request.teacherId()));
        Lesson lesson = Lesson.builder()
                .group(group)
                .course(course)
                .teacher(teacher)
                .topic(request.topic())
                .scheduledAt(request.scheduledAt())
                .build();
        return LessonDto.from(lessonRepository.save(lesson));
    }

    @Transactional
    public LessonDto update(Long id, UpdateLessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", id));
        if (request.groupId() != null) {
            Group group = groupRepository.findById(request.groupId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Group", request.groupId()));
            lesson.setGroup(group);
        }
        if (request.courseId() != null) {
            Course course = courseRepository.findById(request.courseId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
            lesson.setCourse(course);
        }
        if (request.teacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.teacherId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Teacher", request.teacherId()));
            lesson.setTeacher(teacher);
        }
        if (StringUtils.hasText(request.topic())) {
            lesson.setTopic(request.topic());
        }
        if (request.scheduledAt() != null) {
            lesson.setScheduledAt(request.scheduledAt());
        }
        return LessonDto.from(lesson);
    }

    @Transactional
    public void delete(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Lesson", id));
        lessonRepository.delete(lesson);
    }
}
