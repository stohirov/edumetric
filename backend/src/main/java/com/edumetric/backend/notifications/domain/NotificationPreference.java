package com.edumetric.backend.notifications.domain;

import com.edumetric.backend.users.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Per-user, per-event override of the in-app/email notification channels. The global
 * {@code users.notify_in_app}/{@code notify_email} switches remain the master toggles; a row here
 * narrows a single event type further. Absence of a row means "use the channel default" (both on).
 */
@Entity
@Table(name = "notification_preferences", uniqueConstraints = @UniqueConstraint(
        name = "uk_notification_preferences_user_event",
        columnNames = {"user_id", "event_type"}))
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 32)
    private NotificationType eventType;

    @Column(name = "in_app", nullable = false)
    @Builder.Default
    private boolean inApp = true;

    @Column(name = "email", nullable = false)
    @Builder.Default
    private boolean email = true;
}
