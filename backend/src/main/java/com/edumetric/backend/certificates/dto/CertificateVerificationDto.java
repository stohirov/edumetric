package com.edumetric.backend.certificates.dto;

import java.time.Instant;

/** Result of the public certificate verification endpoint. */
public record CertificateVerificationDto(
        boolean valid,
        String studentName,
        String courseName,
        Instant completedAt,
        String certificateCode) {
}
