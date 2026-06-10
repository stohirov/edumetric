package com.edumetric.backend.quizzes.dto;

import com.edumetric.backend.quizzes.domain.QuizOption;

/** An option as shown to a student taking a quiz — never exposes the correct flag. */
public record TakeOptionDto(Long id, String text) {

    public static TakeOptionDto from(QuizOption o) {
        return new TakeOptionDto(o.getId(), o.getText());
    }
}
