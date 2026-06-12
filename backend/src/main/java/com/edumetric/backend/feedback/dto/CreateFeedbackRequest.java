package com.edumetric.backend.feedback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateFeedbackRequest(
        @NotNull Long assignmentId,
        @NotNull Long studentId,
        @NotBlank String body) {}
