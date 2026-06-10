package com.edumetric.backend.quizzes.dto;

import jakarta.validation.constraints.NotBlank;

/** An option (or accepted short answer) when authoring a question. */
public record OptionRequest(
        @NotBlank String text,
        boolean correct
) {
}
