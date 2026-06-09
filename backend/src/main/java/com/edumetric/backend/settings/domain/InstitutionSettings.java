package com.edumetric.backend.settings.domain;

import com.edumetric.backend.common.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Institution-wide configuration. Modelled as a singleton — exactly one row is
 * maintained ({@link com.edumetric.backend.settings.SettingsService} lazily
 * creates it on first read).
 */
@Entity
@Table(name = "institution_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class InstitutionSettings extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "institution_name", nullable = false)
    @Builder.Default
    private String institutionName = "EduMetric";

    @Column(name = "default_locale", nullable = false, length = 8)
    @Builder.Default
    private String defaultLocale = "en";

    @Column(name = "primary_color", length = 16)
    private String primaryColor;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "grading_scale", nullable = false, length = 16)
    @Builder.Default
    private GradingScale gradingScale = GradingScale.PERCENT;

    @Column(name = "at_risk_threshold", nullable = false)
    @Builder.Default
    private double atRiskThreshold = 60.0;
}
