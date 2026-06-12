package com.edumetric.backend.plagiarism.dto;

import com.edumetric.backend.plagiarism.domain.PlagiarismReport;
import java.math.BigDecimal;
import java.time.Instant;

/** A flagged plagiarism pair as exposed to teachers/admins. */
public record PlagiarismReportDto(
        Long id,
        Long assignmentId,
        Long studentAId,
        String studentAName,
        Long studentBId,
        String studentBName,
        BigDecimal similarity,
        Instant createdAt) {

    public static PlagiarismReportDto from(PlagiarismReport report) {
        return new PlagiarismReportDto(
                report.getId(),
                report.getAssignment().getId(),
                report.getStudentA().getId(),
                report.getStudentA().getUser().getFullName(),
                report.getStudentB().getId(),
                report.getStudentB().getUser().getFullName(),
                report.getSimilarity(),
                report.getCreatedAt());
    }
}
