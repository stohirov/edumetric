package com.edumetric.backend.metrics.dto;

import com.edumetric.backend.metrics.domain.FormulaConfig;
import java.math.BigDecimal;
import java.time.Instant;

public record FormulaConfigDto(
        Long id,
        String version,
        BigDecimal weightGrades,
        BigDecimal weightAttendance,
        BigDecimal weightPractical,
        BigDecimal weightBehavior,
        BigDecimal weightActivity,
        BigDecimal weightGrowth,
        BigDecimal weightConsistency,
        boolean active,
        Instant createdAt) {

    public static FormulaConfigDto from(FormulaConfig c) {
        return new FormulaConfigDto(
                c.getId(),
                c.getVersion(),
                c.getWeightGrades(),
                c.getWeightAttendance(),
                c.getWeightPractical(),
                c.getWeightBehavior(),
                c.getWeightActivity(),
                c.getWeightGrowth(),
                c.getWeightConsistency(),
                c.isActive(),
                c.getCreatedAt());
    }
}
