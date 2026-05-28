package com.edumetric.backend.teachers.dto;

import com.edumetric.backend.teachers.domain.Teacher;

public record TeacherDto(Long id, Long userId, String email, String fullName, String department) {

    public static TeacherDto from(Teacher teacher) {
        return new TeacherDto(
                teacher.getId(),
                teacher.getUser().getId(),
                teacher.getUser().getEmail(),
                teacher.getUser().getFullName(),
                teacher.getDepartment());
    }
}
