package com.edumetric.backend.teaching.dto;

import com.edumetric.backend.teaching.domain.AssignmentRole;
import com.edumetric.backend.teaching.domain.CourseTeacher;
import java.time.Instant;

public record CourseTeacherDto(
        Long id,
        Long courseId,
        Long teacherId,
        String teacherName,
        String teacherEmail,
        AssignmentRole assignmentRole,
        Instant createdAt) {

    public static CourseTeacherDto from(CourseTeacher courseTeacher) {
        return new CourseTeacherDto(
                courseTeacher.getId(),
                courseTeacher.getCourse().getId(),
                courseTeacher.getTeacher().getId(),
                courseTeacher.getTeacher().getUser().getFullName(),
                courseTeacher.getTeacher().getUser().getEmail(),
                courseTeacher.getAssignmentRole(),
                courseTeacher.getCreatedAt());
    }
}
