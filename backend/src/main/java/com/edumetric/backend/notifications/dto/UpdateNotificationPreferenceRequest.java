package com.edumetric.backend.notifications.dto;

import com.edumetric.backend.notifications.domain.NotificationType;
import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPreferenceRequest(
        @NotNull NotificationType eventType,
        @NotNull Boolean inApp,
        @NotNull Boolean email) {
}
