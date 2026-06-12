package com.edumetric.backend.grades.dto;

import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.AssignmentType;
import java.math.BigDecimal;
import java.time.LocalDate;

/** An assignment as exposed to teachers/admins. */
public record AssignmentDto(
        Long id,
        Long courseId,
        String courseName,
        String name,
        AssignmentType type,
        BigDecimal maxValue,
        BigDecimal weight,
        LocalDate dueDate,
        Long categoryId) {

    public static AssignmentDto from(Assignment assignment) {
        return new AssignmentDto(
                assignment.getId(),
                assignment.getCourse().getId(),
                assignment.getCourse().getName(),
                assignment.getName(),
                assignment.getType(),
                assignment.getMaxValue(),
                assignment.getWeight(),
                assignment.getDueDate(),
                assignment.getCategoryId());
    }
}
