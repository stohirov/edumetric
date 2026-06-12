package com.edumetric.backend.rubrics.dto;

import com.edumetric.backend.rubrics.domain.RubricScore;
import java.math.BigDecimal;

public record RubricScoreDto(Long criterionId, Long studentId, BigDecimal points, String comment) {

    public static RubricScoreDto from(RubricScore score) {
        return new RubricScoreDto(
                score.getCriterion().getId(),
                score.getStudent().getId(),
                score.getPoints(),
                score.getComment());
    }
}
