package com.edumetric.backend.quizzes.dto;

import java.math.BigDecimal;

/** Per-question outcome returned after grading an attempt. */
public record QuestionResultDto(
        Long questionId,
        BigDecimal awardedPoints,
        BigDecimal maxPoints,
        boolean correct) {
}
