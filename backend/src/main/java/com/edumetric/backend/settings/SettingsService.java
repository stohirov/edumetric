package com.edumetric.backend.settings;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.settings.domain.GradingScale;
import com.edumetric.backend.settings.domain.InstitutionSettings;
import com.edumetric.backend.settings.dto.InstitutionSettingsDto;
import com.edumetric.backend.settings.dto.UpdateInstitutionSettingsRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public InstitutionSettingsDto getSettings() {
        return InstitutionSettingsDto.from(findOrInit());
    }

    @Transactional
    public InstitutionSettingsDto updateSettings(UpdateInstitutionSettingsRequest request, AuthenticatedUser actor) {
        InstitutionSettings settings = settingsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> InstitutionSettings.builder().build());
        if (request.institutionName() != null) {
            settings.setInstitutionName(request.institutionName());
        }
        if (request.defaultLocale() != null) {
            settings.setDefaultLocale(request.defaultLocale());
        }
        if (request.primaryColor() != null) {
            settings.setPrimaryColor(request.primaryColor());
        }
        if (request.logoUrl() != null) {
            settings.setLogoUrl(request.logoUrl());
        }
        if (request.gradingScale() != null) {
            settings.setGradingScale(request.gradingScale());
        }
        if (request.atRiskThreshold() != null) {
            settings.setAtRiskThreshold(request.atRiskThreshold());
        }
        InstitutionSettings saved = settingsRepository.save(settings);
        auditLogService.log("InstitutionSettings", saved.getId(), "SETTINGS_UPDATE",
                actor == null ? null : actor.id(),
                Map.of("institutionName", saved.getInstitutionName()));
        return InstitutionSettingsDto.from(saved);
    }

    /** The institution-wide grading scale used to present computed grades. */
    @Transactional(readOnly = true)
    public GradingScale currentGradingScale() {
        return settingsRepository.findTopByOrderByIdAsc()
                .map(InstitutionSettings::getGradingScale)
                .orElse(GradingScale.PERCENT);
    }

    /** Returns the singleton settings row, creating defaults on first access. */
    private InstitutionSettings findOrInit() {
        return settingsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> settingsRepository.save(InstitutionSettings.builder().build()));
    }
}
