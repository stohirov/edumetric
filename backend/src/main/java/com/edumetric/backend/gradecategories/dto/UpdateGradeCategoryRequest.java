package com.edumetric.backend.gradecategories.dto;

import java.math.BigDecimal;

public record UpdateGradeCategoryRequest(
        String name,
        BigDecimal weight,
        Integer position
) {
}
