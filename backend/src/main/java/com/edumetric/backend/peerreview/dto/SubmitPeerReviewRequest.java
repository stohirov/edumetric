package com.edumetric.backend.peerreview.dto;

import java.math.BigDecimal;

public record SubmitPeerReviewRequest(
        BigDecimal score,
        String comments) {
}
