package com.edumetric.backend.metrics.domain;

import com.edumetric.backend.students.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "student_metrics")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StudentMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(name = "composite_score", precision = 6, scale = 2)
    private BigDecimal compositeScore;

    @Column(name = "grades_norm", precision = 6, scale = 2)
    private BigDecimal gradesNorm;

    @Column(name = "attendance_norm", precision = 6, scale = 2)
    private BigDecimal attendanceNorm;

    @Column(name = "practical_norm", precision = 6, scale = 2)
    private BigDecimal practicalNorm;

    @Column(name = "behavior_norm", precision = 6, scale = 2)
    private BigDecimal behaviorNorm;

    @Column(name = "activity_norm", precision = 6, scale = 2)
    private BigDecimal activityNorm;

    @Column(name = "growth_bonus", precision = 6, scale = 2)
    private BigDecimal growthBonus;

    @Column(name = "consistency_bonus", precision = 6, scale = 2)
    private BigDecimal consistencyBonus;

    @Column(name = "formula_version", nullable = false, length = 64)
    private String formulaVersion;

    @Column(name = "sample_size", nullable = false)
    private int sampleSize;

    /** A composite was computed but on too thin a sample to be statistically reliable. */
    @Column(name = "low_confidence", nullable = false)
    private boolean lowConfidence;

    @Column(name = "computed_at", nullable = false)
    private Instant computedAt;
}
