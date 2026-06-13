package com.edumetric.backend.metrics.dto;

import com.edumetric.backend.metrics.domain.StudentMetrics;
import java.math.BigDecimal;
import java.time.Instant;

public record StudentMetricsDto(
        Long studentId,
        BigDecimal compositeScore,
        BigDecimal gradesNorm,
        BigDecimal attendanceNorm,
        BigDecimal practicalNorm,
        BigDecimal behaviorNorm,
        BigDecimal activityNorm,
        BigDecimal growthBonus,
        BigDecimal consistencyBonus,
        String formulaVersion,
        int sampleSize,
        boolean insufficientData,
        boolean lowConfidence,
        Instant computedAt) {

    public static StudentMetricsDto from(StudentMetrics m) {
        return new StudentMetricsDto(
                m.getStudent().getId(),
                m.getCompositeScore(),
                m.getGradesNorm(),
                m.getAttendanceNorm(),
                m.getPracticalNorm(),
                m.getBehaviorNorm(),
                m.getActivityNorm(),
                m.getGrowthBonus(),
                m.getConsistencyBonus(),
                m.getFormulaVersion(),
                m.getSampleSize(),
                m.getCompositeScore() == null,
                m.isLowConfidence(),
                m.getComputedAt());
    }
}
