package com.edumetric.backend.catalog.dto;

import jakarta.validation.constraints.NotNull;

public record CreateEnrollmentRequestRequest(
        @NotNull Long groupId,
        String message) {
}
