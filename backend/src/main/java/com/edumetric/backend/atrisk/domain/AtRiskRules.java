package com.edumetric.backend.atrisk.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Configurable, multi-factor at-risk detection rules. Modelled as a singleton (one row, seeded
 * with id 1) — a student is flagged at-risk when ANY enabled factor trips: composite below
 * {@code compositeThreshold}, attendance below {@code attendanceThreshold}, or (optionally) a
 * low-confidence score. Replaces the old hardcoded {@code composite < 50} rule.
 */
@Entity
@Table(name = "at_risk_rules")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AtRiskRules {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "composite_threshold", nullable = false)
    @Builder.Default
    private double compositeThreshold = 50.0;

    @Column(name = "attendance_threshold", nullable = false)
    @Builder.Default
    private double attendanceThreshold = 70.0;

    @Column(name = "flag_low_confidence", nullable = false)
    @Builder.Default
    private boolean flagLowConfidence = false;

    @Column(name = "composite_enabled", nullable = false)
    @Builder.Default
    private boolean compositeEnabled = true;

    @Column(name = "attendance_enabled", nullable = false)
    @Builder.Default
    private boolean attendanceEnabled = true;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
