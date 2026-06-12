package com.edumetric.backend.notifications.dto;

import com.edumetric.backend.notifications.domain.Notification;
import com.edumetric.backend.notifications.domain.NotificationType;
import java.time.Instant;

public record NotificationDto(
        Long id,
        NotificationType type,
        String title,
        String body,
        String link,
        boolean read,
        Instant createdAt) {

    public static NotificationDto from(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getBody(),
                n.getLink(),
                n.getReadAt() != null,
                n.getCreatedAt());
    }
}
