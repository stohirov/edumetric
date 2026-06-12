package com.edumetric.backend.enrollment.dto;

import com.edumetric.backend.enrollment.domain.Enrollment;
import com.edumetric.backend.enrollment.domain.EnrollmentStatus;
import java.time.LocalDate;

public record EnrollmentDto(
        Long id,
        Long studentId,
        String studentName,
        Long groupId,
        String groupName,
        EnrollmentStatus status,
        LocalDate enrolledAt,
        LocalDate endedAt,
        String reason) {

    public static EnrollmentDto from(Enrollment enrollment) {
        return new EnrollmentDto(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getStudent().getUser().getFullName(),
                enrollment.getGroup().getId(),
                enrollment.getGroup().getName(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt(),
                enrollment.getEndedAt(),
                enrollment.getReason());
    }
}
