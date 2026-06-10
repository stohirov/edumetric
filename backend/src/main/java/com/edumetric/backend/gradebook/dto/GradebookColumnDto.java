package com.edumetric.backend.gradebook.dto;

import com.edumetric.backend.grades.domain.AssignmentType;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One assignment column in the gradebook, enriched with cohort-level stats so a
 * teacher can see at a glance which assignments are under-graded or low-scoring.
 */
public record GradebookColumnDto(
        Long assignmentId,
        String name,
        AssignmentType type,
        BigDecimal maxValue,
        BigDecimal weight,
        LocalDate dueDate,
        int gradedCount,
        int missingCount,
        Double averagePercent) {
}
