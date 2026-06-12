package com.edumetric.backend.checkin.dto;

import com.edumetric.backend.checkin.domain.LessonCheckin;
import java.time.Instant;

public record LessonCheckinDto(
        Long lessonId,
        String code,
        boolean open,
        Instant openedAt,
        Instant expiresAt) {

    public static LessonCheckinDto from(LessonCheckin checkin) {
        return new LessonCheckinDto(
                checkin.getLesson().getId(),
                checkin.getCode(),
                checkin.isOpen(),
                checkin.getOpenedAt(),
                checkin.getExpiresAt());
    }
}
