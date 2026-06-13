package com.edumetric.backend.metrics.dto;

import java.util.List;

/**
 * Result of simulating a proposed formula against every student WITHOUT persisting it — lets an
 * admin see the blast radius (how many students move, average shift, biggest movers) before
 * committing a formula change.
 */
public record FormulaPreviewDto(
        int comparableStudents,
        int affected,
        int increased,
        int decreased,
        double averageDelta,
        double maxIncrease,
        double maxDecrease,
        Double currentAverage,
        Double projectedAverage,
        List<Mover> topMovers) {

    public record Mover(
            Long studentId,
            String studentName,
            Double currentScore,
            Double projectedScore,
            double delta) {
    }
}
