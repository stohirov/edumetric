package com.edumetric.backend.reminders.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Idempotency ledger for sent reminders. One row per (type, referenced entity, recipient) — its
 * unique constraint is what stops the daily {@code ReminderJob} from re-pinging the same student
 * about the same lesson/assignment on overlapping runs.
 */
@Entity
@Table(name = "reminder_log", uniqueConstraints = @UniqueConstraint(
        name = "uk_reminder_log_type_ref_user",
        columnNames = {"reminder_type", "ref_id", "user_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ReminderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false, length = 32)
    private ReminderType reminderType;

    @Column(name = "ref_id", nullable = false)
    private Long refId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
