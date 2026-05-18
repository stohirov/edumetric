package com.edumetric.backend.grades.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateGradeRequest(
        @NotNull Long studentId,
        @NotNull Long assignmentId,
        @NotNull @DecimalMin("0.0") BigDecimal value,
        String comment
) {
}
