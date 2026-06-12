package com.edumetric.backend.feedback.dto;

import com.edumetric.backend.feedback.domain.SubmissionFeedback;
import java.time.Instant;

public record FeedbackDto(
        Long id,
        Long assignmentId,
        Long studentId,
        String authorName,
        String body,
        Instant createdAt) {

    public static FeedbackDto from(SubmissionFeedback f) {
        return new FeedbackDto(
                f.getId(),
                f.getAssignment().getId(),
                f.getStudent().getId(),
                f.getAuthor().getFullName(),
                f.getBody(),
                f.getCreatedAt());
    }
}
