package com.edumetric.backend.quizzes.dto;

import java.math.BigDecimal;

/** Summary of a published quiz as seen by a student, with their attempt history. */
public record StudentQuizDto(
        Long id,
        String title,
        String description,
        Integer timeLimitMinutes,
        Integer maxAttempts,
        BigDecimal passScore,
        int questionCount,
        BigDecimal totalPoints,
        int attemptsUsed,
        BigDecimal bestScore,
        Boolean lastPassed) {
}
