package com.edumetric.backend.metrics.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "formula_config")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class FormulaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String version;

    @Column(name = "weight_grades", nullable = false, precision = 6, scale = 4)
    private BigDecimal weightGrades;

    @Column(name = "weight_attendance", nullable = false, precision = 6, scale = 4)
    private BigDecimal weightAttendance;

    @Column(name = "weight_practical", nullable = false, precision = 6, scale = 4)
    private BigDecimal weightPractical;

    @Column(name = "weight_behavior", nullable = false, precision = 6, scale = 4)
    private BigDecimal weightBehavior;

    @Column(name = "weight_activity", nullable = false, precision = 6, scale = 4)
    private BigDecimal weightActivity;

    @Column(name = "weight_growth", nullable = false, precision = 6, scale = 4)
    private BigDecimal weightGrowth;

    @Column(name = "weight_consistency", nullable = false, precision = 6, scale = 4)
    private BigDecimal weightConsistency;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
