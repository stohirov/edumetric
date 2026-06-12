package com.edumetric.backend.peerreview.dto;

import jakarta.validation.constraints.NotNull;

public record AssignPeerReviewRequest(
        @NotNull Long assignmentId,
        @NotNull Long reviewerStudentId,
        @NotNull Long revieweeStudentId) {
}
