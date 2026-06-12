package com.edumetric.backend.appeals.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAppealRequest(
        @NotNull Long assignmentId,
        @NotBlank String reason) {
}
