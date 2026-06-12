package com.edumetric.backend.notifications.dto;

import com.edumetric.backend.notifications.domain.Announcement;
import com.edumetric.backend.notifications.domain.AnnouncementScope;
import java.time.Instant;

public record AnnouncementDto(
        Long id,
        String authorName,
        AnnouncementScope scope,
        Long groupId,
        String groupName,
        String title,
        String body,
        Instant createdAt) {

    public static AnnouncementDto from(Announcement a) {
        return new AnnouncementDto(
                a.getId(),
                a.getAuthor().getFullName(),
                a.getScope(),
                a.getGroup() != null ? a.getGroup().getId() : null,
                a.getGroup() != null ? a.getGroup().getName() : null,
                a.getTitle(),
                a.getBody(),
                a.getCreatedAt());
    }
}
