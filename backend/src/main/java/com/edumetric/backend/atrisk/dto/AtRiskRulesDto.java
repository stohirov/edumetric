package com.edumetric.backend.atrisk.dto;

import com.edumetric.backend.atrisk.domain.AtRiskRules;
import java.time.Instant;

public record AtRiskRulesDto(
        double compositeThreshold,
        double attendanceThreshold,
        boolean flagLowConfidence,
        boolean compositeEnabled,
        boolean attendanceEnabled,
        Instant updatedAt) {

    public static AtRiskRulesDto from(AtRiskRules r) {
        return new AtRiskRulesDto(
                r.getCompositeThreshold(),
                r.getAttendanceThreshold(),
                r.isFlagLowConfidence(),
                r.isCompositeEnabled(),
                r.isAttendanceEnabled(),
                r.getUpdatedAt());
    }
}
