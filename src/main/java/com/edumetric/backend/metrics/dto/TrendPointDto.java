package com.edumetric.backend.metrics.dto;

import com.edumetric.backend.metrics.domain.MetricSnapshot;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TrendPointDto(
        LocalDate date,
        BigDecimal compositeScore,
        BigDecimal gradesNorm,
        BigDecimal attendanceNorm,
        BigDecimal practicalNorm,
        BigDecimal behaviorNorm,
        BigDecimal activityNorm) {

    public static TrendPointDto from(MetricSnapshot s) {
        return new TrendPointDto(
                s.getSnapshotDate(),
                s.getCompositeScore(),
                s.getGradesNorm(),
                s.getAttendanceNorm(),
                s.getPracticalNorm(),
                s.getBehaviorNorm(),
                s.getActivityNorm());
    }
}
