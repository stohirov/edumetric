package com.edumetric.backend.settings.dto;

import com.edumetric.backend.settings.domain.GradingScale;
import com.edumetric.backend.settings.domain.InstitutionSettings;

public record InstitutionSettingsDto(
        String institutionName,
        String defaultLocale,
        String primaryColor,
        String logoUrl,
        GradingScale gradingScale,
        double atRiskThreshold
) {

    public static InstitutionSettingsDto from(InstitutionSettings s) {
        return new InstitutionSettingsDto(
                s.getInstitutionName(),
                s.getDefaultLocale(),
                s.getPrimaryColor(),
                s.getLogoUrl(),
                s.getGradingScale(),
                s.getAtRiskThreshold());
    }
}
