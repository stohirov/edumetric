package com.edumetric.backend.enrollment.dto;

import jakarta.validation.constraints.NotNull;

public record TransferRequest(
        @NotNull Long studentId,
        @NotNull Long groupId,
        String reason) {
}
