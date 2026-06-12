package com.edumetric.backend.rubrics.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RubricScoreInput(
        @NotNull Long criterionId, @NotNull BigDecimal points, String comment) {
}
