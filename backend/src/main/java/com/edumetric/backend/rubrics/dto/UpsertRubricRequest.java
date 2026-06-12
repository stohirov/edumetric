package com.edumetric.backend.rubrics.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record UpsertRubricRequest(
        @NotNull Long assignmentId,
        @NotBlank String name,
        @NotNull @Valid List<CriterionInput> criteria) {

    public record CriterionInput(
            @NotBlank String label, @NotNull BigDecimal maxPoints, Integer position) {
    }
}
