package com.edumetric.backend.grades.dto;

import com.edumetric.backend.grades.domain.AssignmentType;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Partial update — only non-null fields are applied. */
public record UpdateAssignmentRequest(
        String name,
        AssignmentType type,
        @DecimalMin("0.0") BigDecimal maxValue,
        @DecimalMin("0.0") BigDecimal weight,
        LocalDate dueDate,
        // 0 clears the category assignment.
        Long categoryId
) {
}
