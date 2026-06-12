package com.edumetric.backend.peerreview.dto;

import com.edumetric.backend.peerreview.domain.PeerReview;
import com.edumetric.backend.peerreview.domain.PeerReviewStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record PeerReviewDto(
        Long id,
        Long assignmentId,
        String assignmentName,
        Long reviewerStudentId,
        String reviewerName,
        Long revieweeStudentId,
        String revieweeName,
        PeerReviewStatus status,
        BigDecimal score,
        String comments,
        Instant createdAt,
        Instant submittedAt) {

    public static PeerReviewDto from(PeerReview review) {
        return new PeerReviewDto(
                review.getId(),
                review.getAssignment().getId(),
                review.getAssignment().getName(),
                review.getReviewer().getId(),
                review.getReviewer().getUser().getFullName(),
                review.getReviewee().getId(),
                review.getReviewee().getUser().getFullName(),
                review.getStatus(),
                review.getScore(),
                review.getComments(),
                review.getCreatedAt(),
                review.getSubmittedAt());
    }
}
