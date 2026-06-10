package com.edumetric.backend.quizzes.dto;

import com.edumetric.backend.quizzes.domain.QuizOption;

/** A quiz option as exposed to teachers/admins (includes the correct flag). */
public record OptionDto(Long id, String text, boolean correct, int position) {

    public static OptionDto from(QuizOption o) {
        return new OptionDto(o.getId(), o.getText(), o.isCorrect(), o.getPosition());
    }
}
