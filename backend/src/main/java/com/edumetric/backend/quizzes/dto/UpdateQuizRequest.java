package com.edumetric.backend.quizzes.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record UpdateQuizRequest(
        Long moduleId,
        String title,
        String description,
        Integer timeLimitMinutes,
        Integer maxAttempts,
        @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal passScore,
        Boolean shuffleQuestions,
        Boolean published
) {
}
