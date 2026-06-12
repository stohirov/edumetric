package com.edumetric.backend.certificates.dto;

import com.edumetric.backend.certificates.domain.CourseCompletion;
import java.time.Instant;

public record CertificateDto(
        Long id,
        Long studentId,
        String studentName,
        Long courseId,
        String courseName,
        String certificateCode,
        Instant completedAt) {

    public static CertificateDto from(CourseCompletion completion) {
        return new CertificateDto(
                completion.getId(),
                completion.getStudent().getId(),
                completion.getStudent().getUser().getFullName(),
                completion.getCourse().getId(),
                completion.getCourse().getName(),
                completion.getCertificateCode(),
                completion.getCompletedAt());
    }
}
