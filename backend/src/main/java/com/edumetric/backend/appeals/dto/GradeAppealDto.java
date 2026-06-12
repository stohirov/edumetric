package com.edumetric.backend.appeals.dto;

import com.edumetric.backend.appeals.domain.AppealStatus;
import com.edumetric.backend.appeals.domain.GradeAppeal;
import java.time.Instant;

public record GradeAppealDto(
        Long id,
        Long assignmentId,
        String assignmentName,
        String courseName,
        Long studentId,
        String studentName,
        String reason,
        AppealStatus status,
        String resolution,
        Instant createdAt,
        Instant resolvedAt) {

    public static GradeAppealDto from(GradeAppeal appeal) {
        return new GradeAppealDto(
                appeal.getId(),
                appeal.getAssignment().getId(),
                appeal.getAssignment().getName(),
                appeal.getAssignment().getCourse().getName(),
                appeal.getStudent().getId(),
                appeal.getStudent().getUser().getFullName(),
                appeal.getReason(),
                appeal.getStatus(),
                appeal.getResolution(),
                appeal.getCreatedAt(),
                appeal.getResolvedAt());
    }
}
