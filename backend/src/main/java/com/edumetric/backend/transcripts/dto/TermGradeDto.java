package com.edumetric.backend.transcripts.dto;

import com.edumetric.backend.transcripts.domain.TermGrade;
import java.math.BigDecimal;
import java.time.Instant;

/** A finalized course grade for one student in one term, as returned by the API. */
public record TermGradeDto(
        Long id,
        Long studentId,
        String studentName,
        Long courseId,
        String courseName,
        Long termId,
        String termName,
        BigDecimal finalPercent,
        String letter,
        BigDecimal gpa,
        Instant createdAt) {

    public static TermGradeDto from(TermGrade tg) {
        return new TermGradeDto(
                tg.getId(),
                tg.getStudent().getId(),
                tg.getStudent().getUser().getFullName(),
                tg.getCourse().getId(),
                tg.getCourse().getName(),
                tg.getTerm().getId(),
                tg.getTerm().getName(),
                tg.getFinalPercent(),
                tg.getLetter(),
                tg.getGpa(),
                tg.getCreatedAt());
    }
}
