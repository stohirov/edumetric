package com.edumetric.backend.analytics.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Side-by-side comparison of every group/cohort plus an institution-wide longitudinal series
 * (composite average per month from snapshots) for term-over-term reading.
 */
public record CohortComparisonDto(
        List<CohortRow> cohorts,
        List<LongitudinalPoint> longitudinal) {

    public record CohortRow(
            Long groupId,
            String groupName,
            long studentCount,
            Double avgComposite,
            Double avgAttendance,
            Double avgGrades,
            long atRiskCount) {
    }

    public record LongitudinalPoint(
            String label,
            BigDecimal avgComposite) {
    }
}
