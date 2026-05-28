package com.edumetric.backend.metrics.domain;

import com.edumetric.backend.students.domain.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "metric_snapshots", uniqueConstraints = @UniqueConstraint(
        name = "uk_metric_snapshots_student_date",
        columnNames = {"student_id", "snapshot_date"}))
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MetricSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

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
}
