package com.edumetric.backend.notifications.dto;

import com.edumetric.backend.notifications.domain.NotificationType;

/** One row per notifiable event type, carrying the effective in-app/email channel choices. */
public record NotificationPreferenceDto(
        NotificationType eventType,
        boolean inApp,
        boolean email) {
}
