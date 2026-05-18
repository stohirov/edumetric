package com.edumetric.backend.grades.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record UpdateGradeRequest(
        @DecimalMin("0.0") BigDecimal value,
        String comment
) {
}
