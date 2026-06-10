package com.edumetric.backend.quizzes.dto;

import java.util.List;

/** A published quiz prepared for a student to take. */
public record TakeQuizDto(
        Long id,
        String title,
        String description,
        Integer timeLimitMinutes,
        Integer maxAttempts,
        int attemptsUsed,
        List<TakeQuestionDto> questions) {
}
