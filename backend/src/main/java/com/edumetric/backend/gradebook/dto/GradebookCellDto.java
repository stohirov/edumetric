package com.edumetric.backend.gradebook.dto;

import java.math.BigDecimal;

/**
 * One (student, column) cell, matched to its column via {@code key}. For an
 * assignment cell {@code gradeId} is null until graded and {@code submitted}
 * flags a homework submission still awaiting a grade — which is what unifies the
 * homework and grade surfaces. For a quiz cell {@code quizId} is set and the
 * value comes from the student's best auto-graded attempt (never "submitted").
 */
public record GradebookCellDto(
        String key,
        Long assignmentId,
        Long quizId,
        Long gradeId,
        BigDecimal value,
        Double percent,
        boolean submitted,
        String comment) {

    /** A graded assignment cell. */
    public static GradebookCellDto graded(
            String key, Long assignmentId, Long gradeId, BigDecimal value, double percent, String comment) {
        return new GradebookCellDto(key, assignmentId, null, gradeId, value, percent, false, comment);
    }

    /** An auto-graded quiz cell (best attempt). */
    public static GradebookCellDto quiz(String key, Long quizId, BigDecimal value, double percent) {
        return new GradebookCellDto(key, null, quizId, null, value, percent, false, null);
    }

    /** An empty cell; {@code submitted} marks an ungraded homework submission. */
    public static GradebookCellDto empty(String key, Long assignmentId, Long quizId, boolean submitted) {
        return new GradebookCellDto(key, assignmentId, quizId, null, null, null, submitted, null);
    }
}
