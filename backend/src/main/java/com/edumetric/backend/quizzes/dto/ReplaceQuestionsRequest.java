package com.edumetric.backend.quizzes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/** Replaces a quiz's entire question set in one call. */
public record ReplaceQuestionsRequest(
        @NotNull @Valid List<QuestionRequest> questions
) {
}
