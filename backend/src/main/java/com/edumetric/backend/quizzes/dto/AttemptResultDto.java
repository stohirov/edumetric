package com.edumetric.backend.quizzes.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** The graded outcome of a quiz attempt. */
public record AttemptResultDto(
        Long attemptId,
        Long quizId,
        BigDecimal score,
        BigDecimal maxScore,
        Boolean passed,
        Instant submittedAt,
        List<QuestionResultDto> results) {
}
