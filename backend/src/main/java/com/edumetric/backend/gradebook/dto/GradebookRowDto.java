package com.edumetric.backend.gradebook.dto;

import java.util.List;

/**
 * One student row: their cell for every column plus the unified course grade
 * ({@code coursePercent} computed weighted across graded assignments, and
 * {@code display} the same value rendered in the institution grading scale).
 */
public record GradebookRowDto(
        Long studentId,
        String studentName,
        Long groupId,
        String groupName,
        List<GradebookCellDto> cells,
        int gradedCount,
        Double coursePercent,
        String display) {
}
