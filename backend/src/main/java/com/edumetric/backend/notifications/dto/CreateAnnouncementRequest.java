package com.edumetric.backend.notifications.dto;

import com.edumetric.backend.notifications.domain.AnnouncementScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAnnouncementRequest(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 4000) String body,
        @NotNull AnnouncementScope scope,
        Long groupId) {}
