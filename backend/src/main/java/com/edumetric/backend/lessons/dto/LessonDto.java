package com.edumetric.backend.lessons.dto;

import com.edumetric.backend.lessons.domain.Lesson;
import java.time.OffsetDateTime;

public record LessonDto(
        Long id,
        Long groupId,
        String groupName,
        Long courseId,
        String courseName,
        Long teacherId,
        String teacherName,
        String topic,
        OffsetDateTime scheduledAt) {

    public static LessonDto from(Lesson lesson) {
        return new LessonDto(
                lesson.getId(),
                lesson.getGroup().getId(),
                lesson.getGroup().getName(),
                lesson.getCourse().getId(),
                lesson.getCourse().getName(),
                lesson.getTeacher().getId(),
                lesson.getTeacher().getUser().getFullName(),
                lesson.getTopic(),
                lesson.getScheduledAt());
    }
}
