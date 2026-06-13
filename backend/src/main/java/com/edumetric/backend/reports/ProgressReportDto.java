package com.edumetric.backend.reports;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ProgressReportDto(
        Long studentId,
        String studentName,
        String studentEmail,
        Long groupId,
        String groupName,
        MetricsSummary metrics,
        List<TrendPointDto> trend,
        AttendanceSummary attendance,
        List<GradeRowDto> grades) {

    public record MetricsSummary(
            BigDecimal composite,
            BigDecimal gradesNorm,
            BigDecimal attendanceNorm,
            BigDecimal practicalNorm,
            BigDecimal behaviorNorm,
            BigDecimal activityNorm,
            BigDecimal growthBonus,
            BigDecimal consistencyBonus,
            int sampleSize,
            String formulaVersion,
            Instant computedAt,
            boolean insufficientData) {
    }

    public record TrendPointDto(LocalDate date, BigDecimal composite) {
    }

    public record AttendanceSummary(
            long present,
            long absent,
            long late,
            long excused,
            BigDecimal attendancePercent) {
    }

    public record GradeRowDto(
            String assignment,
            BigDecimal value,
            BigDecimal max,
            Instant gradedAt) {
    }
}
