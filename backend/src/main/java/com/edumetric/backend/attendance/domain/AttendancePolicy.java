package com.edumetric.backend.attendance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/** Institution-wide attendance policy. A single row (id = 1). */
@Entity
@Table(name = "attendance_policy")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AttendancePolicy {

    public static final Long SINGLETON_ID = 1L;

    @Id
    @EqualsAndHashCode.Include
    private Long id;

    /** Minimum attendance % below which a student is flagged at-risk for attendance. */
    @Column(name = "min_attendance_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal minAttendancePercent;

    /** Number of consecutive absences considered a concern (informational). */
    @Column(name = "consecutive_absence_limit", nullable = false)
    private int consecutiveAbsenceLimit;

    /** When true, marking a student ABSENT raises an in-app notification to them (and parents). */
    @Column(name = "notify_on_absence", nullable = false)
    private boolean notifyOnAbsence;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
