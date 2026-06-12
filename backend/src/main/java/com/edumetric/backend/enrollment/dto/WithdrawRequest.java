package com.edumetric.backend.enrollment.dto;

import jakarta.validation.constraints.NotNull;

public record WithdrawRequest(
        @NotNull Long studentId,
        String reason) {
}
