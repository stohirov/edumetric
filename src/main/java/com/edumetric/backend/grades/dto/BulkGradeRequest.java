package com.edumetric.backend.grades.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record BulkGradeRequest(
        @NotNull Long assignmentId,
        @NotEmpty @Valid List<Entry> entries
) {
    public record Entry(
            @NotNull Long studentId,
            @NotNull @DecimalMin("0.0") BigDecimal value,
            String comment
    ) {
    }
}
