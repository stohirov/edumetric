package com.edumetric.backend.rubrics.dto;

import java.math.BigDecimal;
import java.util.List;

public record ScoreRubricResult(
        Long assignmentId,
        Long studentId,
        BigDecimal total,
        List<RubricScoreDto> scores) {
}
