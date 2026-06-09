package com.edumetric.backend.settings.dto;

import com.edumetric.backend.settings.domain.GradingScale;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Partial update of institution settings — only present fields are applied.
 */
public record UpdateInstitutionSettingsRequest(
        @Size(max = 255) String institutionName,
        @Pattern(regexp = "uz|ru|en", message = "defaultLocale must be one of: uz, ru, en") String defaultLocale,
        @Pattern(regexp = "#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", message = "primaryColor must be a hex color")
        String primaryColor,
        @Size(max = 512) String logoUrl,
        GradingScale gradingScale,
        @DecimalMin("0.0") @DecimalMax("100.0") Double atRiskThreshold
) {
}
