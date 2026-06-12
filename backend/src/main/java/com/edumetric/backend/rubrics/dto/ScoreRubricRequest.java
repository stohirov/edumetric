package com.edumetric.backend.rubrics.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ScoreRubricRequest(
        @NotNull Long assignmentId,
        @NotNull Long studentId,
        @NotNull @Valid List<RubricScoreInput> scores) {
}
