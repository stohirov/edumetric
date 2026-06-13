package com.edumetric.backend.gradebook.dto;

import com.edumetric.backend.grades.domain.AssignmentType;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One column in the gradebook, enriched with cohort-level stats so a teacher can
 * see at a glance which columns are under-graded or low-scoring. A column is
 * either a teacher-graded {@code ASSIGNMENT} or an auto-graded {@code QUIZ}
 * (see {@link GradebookColumnKind}); {@code key} uniquely identifies it across
 * both kinds ({@code "a-<id>"} / {@code "q-<id>"}). {@code assignmentId}/{@code type}/
 * {@code dueDate} are null for quizzes; {@code quizId} is null for assignments.
 */
public record GradebookColumnDto(
        String key,
        GradebookColumnKind kind,
        Long assignmentId,
        Long quizId,
        String name,
        AssignmentType type,
        BigDecimal maxValue,
        BigDecimal weight,
        LocalDate dueDate,
        int gradedCount,
        int missingCount,
        Double averagePercent) {
}
