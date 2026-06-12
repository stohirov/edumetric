package com.edumetric.backend.gradecategories.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateGradeCategoryRequest(
        @NotNull Long courseId,
        @NotBlank String name,
        @NotNull BigDecimal weight,
        Integer position
) {
}
