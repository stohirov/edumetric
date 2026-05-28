package com.edumetric.backend.metrics.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateFormulaRequest(
        @NotBlank String version,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal weightGrades,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal weightAttendance,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal weightPractical,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal weightBehavior,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal weightActivity,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal weightGrowth,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal weightConsistency) {
}
