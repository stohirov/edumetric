package com.edumetric.backend.atrisk.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

/** Partial update — null fields are left unchanged. */
public record UpdateAtRiskRulesRequest(
        @DecimalMin("0.0") @DecimalMax("100.0") Double compositeThreshold,
        @DecimalMin("0.0") @DecimalMax("100.0") Double attendanceThreshold,
        Boolean flagLowConfidence,
        Boolean compositeEnabled,
        Boolean attendanceEnabled) {
}
