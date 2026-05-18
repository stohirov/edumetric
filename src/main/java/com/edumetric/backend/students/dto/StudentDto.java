package com.edumetric.backend.students.dto;

import com.edumetric.backend.students.domain.Student;
import java.time.LocalDate;

public record StudentDto(
        Long id,
        Long userId,
        String email,
        String fullName,
        Long groupId,
        String groupName,
        LocalDate enrolledAt) {

    public static StudentDto from(Student student) {
        return new StudentDto(
                student.getId(),
                student.getUser().getId(),
                student.getUser().getEmail(),
                student.getUser().getFullName(),
                student.getGroup() != null ? student.getGroup().getId() : null,
                student.getGroup() != null ? student.getGroup().getName() : null,
                student.getEnrolledAt());
    }
}
