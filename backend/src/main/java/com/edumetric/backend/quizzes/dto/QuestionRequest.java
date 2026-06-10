package com.edumetric.backend.quizzes.dto;

import com.edumetric.backend.quizzes.domain.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/** A question with its options when replacing a quiz's question set. */
public record QuestionRequest(
        @NotBlank String text,
        @NotNull QuestionType type,
        BigDecimal points,
        @Valid List<OptionRequest> options
) {
}
