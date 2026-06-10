package com.edumetric.backend.quizzes.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

/** A student's answer to one question on submit. */
public record AnswerSubmission(
        @NotNull Long questionId,
        List<Long> selectedOptionIds,
        String textAnswer
) {
}
