package com.edumetric.backend.quizzes.dto;

import com.edumetric.backend.quizzes.domain.QuestionType;
import java.math.BigDecimal;
import java.util.List;

/** A question as shown to a student taking a quiz (no correctness data). */
public record TakeQuestionDto(
        Long id,
        String text,
        QuestionType type,
        BigDecimal points,
        List<TakeOptionDto> options) {
}
