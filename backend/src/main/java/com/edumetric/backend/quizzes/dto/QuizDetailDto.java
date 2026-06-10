package com.edumetric.backend.quizzes.dto;

import java.math.BigDecimal;
import java.util.List;

/** Full quiz with questions and options, for teacher/admin authoring. */
public record QuizDetailDto(
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
        List<QuestionDto> questions) {
}
