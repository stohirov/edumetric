package com.edumetric.backend.grades.dto;

import com.edumetric.backend.grades.domain.AssignmentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateAssignmentRequest(
        @NotNull Long courseId,
        @NotBlank String name,
        @NotNull AssignmentType type,
        @NotNull @DecimalMin("0.0") BigDecimal maxValue,
        @DecimalMin("0.0") BigDecimal weight,
        LocalDate dueDate,
        Long categoryId
) {
}
