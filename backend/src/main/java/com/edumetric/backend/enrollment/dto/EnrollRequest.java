package com.edumetric.backend.enrollment.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollRequest(
        @NotNull Long studentId,
        @NotNull Long groupId,
        String reason) {
}
