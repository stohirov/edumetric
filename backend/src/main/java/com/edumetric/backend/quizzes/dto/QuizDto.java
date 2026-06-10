package com.edumetric.backend.quizzes.dto;

import java.math.BigDecimal;

/** Summary of a quiz for teacher/admin listing. */
public record QuizDto(
        Long id,
        Long courseId,
        String courseName,
        Long moduleId,
        String title,
        String description,
        Integer timeLimitMinutes,
        Integer maxAttempts,
        BigDecimal passScore,
        boolean shuffleQuestions,
        boolean published,
        int questionCount,
        BigDecimal totalPoints) {
}
