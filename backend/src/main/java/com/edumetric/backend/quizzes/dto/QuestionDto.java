package com.edumetric.backend.quizzes.dto;

import com.edumetric.backend.quizzes.domain.QuestionType;
import com.edumetric.backend.quizzes.domain.QuizOption;
import com.edumetric.backend.quizzes.domain.QuizQuestion;
import java.math.BigDecimal;
import java.util.List;

/** A quiz question with its options, for teacher/admin authoring. */
public record QuestionDto(
        Long id,
        String text,
        QuestionType type,
        BigDecimal points,
        int position,
        List<OptionDto> options) {

    public static QuestionDto from(QuizQuestion q, List<QuizOption> options) {
        return new QuestionDto(
                q.getId(),
                q.getText(),
                q.getType(),
                q.getPoints(),
                q.getPosition(),
                options.stream().map(OptionDto::from).toList());
    }
}
