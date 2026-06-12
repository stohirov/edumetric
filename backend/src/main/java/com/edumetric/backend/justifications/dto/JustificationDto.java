package com.edumetric.backend.justifications.dto;

import com.edumetric.backend.justifications.domain.AbsenceJustification;
import com.edumetric.backend.justifications.domain.JustificationStatus;
import java.time.Instant;

public record JustificationDto(
        Long id,
        Long studentId,
        String studentName,
        Long lessonId,
        String lessonTopic,
        String courseName,
        String reason,
        JustificationStatus status,
        Instant createdAt,
        Instant decidedAt) {

    public static JustificationDto from(AbsenceJustification justification) {
        return new JustificationDto(
                justification.getId(),
                justification.getStudent().getId(),
                justification.getStudent().getUser().getFullName(),
                justification.getLesson().getId(),
                justification.getLesson().getTopic(),
                justification.getLesson().getCourse().getName(),
                justification.getReason(),
                justification.getStatus(),
                justification.getCreatedAt(),
                justification.getDecidedAt());
    }
}
