package com.edumetric.backend.grades.dto;

import com.edumetric.backend.grades.domain.Grade;
import java.math.BigDecimal;
import java.time.Instant;

public record GradeDto(
        Long id,
        Long studentId,
        String studentName,
        Long assignmentId,
        String assignmentName,
        BigDecimal value,
        BigDecimal maxValue,
        Long gradedByUserId,
        Instant gradedAt,
        String comment) {

    public static GradeDto from(Grade grade) {
        return new GradeDto(
                grade.getId(),
                grade.getStudent().getId(),
                grade.getStudent().getUser().getFullName(),
                grade.getAssignment().getId(),
                grade.getAssignment().getName(),
                grade.getValue(),
                grade.getAssignment().getMaxValue(),
                grade.getGradedBy().getId(),
                grade.getGradedAt(),
                grade.getComment());
    }
}
