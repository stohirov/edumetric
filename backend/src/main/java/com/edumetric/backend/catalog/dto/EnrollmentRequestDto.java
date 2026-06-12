package com.edumetric.backend.catalog.dto;

import com.edumetric.backend.catalog.domain.EnrollmentRequest;
import com.edumetric.backend.catalog.domain.EnrollmentRequestStatus;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.students.domain.Student;
import java.time.Instant;

public record EnrollmentRequestDto(
        Long id,
        Long studentId,
        String studentName,
        Long groupId,
        String groupName,
        String courseName,
        EnrollmentRequestStatus status,
        String message,
        Instant createdAt,
        Instant decidedAt) {

    public static EnrollmentRequestDto from(EnrollmentRequest request) {
        Student student = request.getStudent();
        Group group = request.getGroup();
        return new EnrollmentRequestDto(
                request.getId(),
                student.getId(),
                student.getUser().getFullName(),
                group.getId(),
                group.getName(),
                group.getCourse().getName(),
                request.getStatus(),
                request.getMessage(),
                request.getCreatedAt(),
                request.getDecidedAt());
    }
}
