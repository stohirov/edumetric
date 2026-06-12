package com.edumetric.backend.rubrics.dto;

import com.edumetric.backend.rubrics.domain.RubricCriterion;
import java.math.BigDecimal;

public record RubricCriterionDto(Long id, String label, BigDecimal maxPoints, Integer position) {

    public static RubricCriterionDto from(RubricCriterion criterion) {
        return new RubricCriterionDto(
                criterion.getId(),
                criterion.getLabel(),
                criterion.getMaxPoints(),
                criterion.getPosition());
    }
}
