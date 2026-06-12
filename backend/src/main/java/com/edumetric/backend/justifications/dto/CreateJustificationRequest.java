package com.edumetric.backend.justifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateJustificationRequest(
        @NotNull Long lessonId,
        @NotBlank String reason) {
}
