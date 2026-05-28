package com.edumetric.backend.behavior.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BehaviorRecordRequest(
        @NotNull Long studentId,
        @NotNull LocalDate periodStart,
        @NotNull LocalDate periodEnd,
        @NotNull @Min(1) @Max(5) Short value,
        String comment
) {

    @AssertTrue(message = "periodEnd must not be before periodStart")
    public boolean isPeriodValid() {
        return periodStart == null || periodEnd == null || !periodEnd.isBefore(periodStart);
    }
}
