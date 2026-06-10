package com.edumetric.backend.gradebook.dto;

import java.math.BigDecimal;

/**
 * One (student, assignment) cell. {@code gradeId} is null until graded;
 * {@code submitted} flags a homework submission that is still awaiting a grade,
 * which is what unifies the homework and grade surfaces into a single view.
 */
public record GradebookCellDto(
        Long assignmentId,
        Long gradeId,
        BigDecimal value,
        Double percent,
        boolean submitted,
        String comment) {

    /** An empty (ungraded, un-submitted) cell. */
    public static GradebookCellDto empty(Long assignmentId, boolean submitted) {
        return new GradebookCellDto(assignmentId, null, null, null, submitted, null);
    }
}
