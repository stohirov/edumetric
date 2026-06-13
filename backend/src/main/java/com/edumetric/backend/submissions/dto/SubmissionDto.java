package com.edumetric.backend.submissions.dto;

import com.edumetric.backend.submissions.domain.Submission;
import com.edumetric.backend.submissions.domain.SubmissionKind;
import com.edumetric.backend.submissions.domain.SubmissionStatus;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * One row of the unified submission inbox: a homework upload or a quiz attempt,
 * presented identically. {@code percent} is the score over max (null when not
 * yet graded).
 */
public record SubmissionDto(
        Long id,
        SubmissionKind kind,
        SubmissionStatus status,
        Long assignmentId,
        Long quizId,
        String title,
        Long courseId,
        String courseName,
        Long studentId,
        String studentName,
        BigDecimal score,
        BigDecimal maxScore,
        Double percent,
        int attemptCount,
        Instant submittedAt,
        Instant gradedAt) {

    public static SubmissionDto from(Submission s) {
        boolean homework = s.getKind() == SubmissionKind.HOMEWORK;
        String title = homework ? s.getAssignment().getName() : s.getQuiz().getTitle();
        return new SubmissionDto(
                s.getId(),
                s.getKind(),
                s.getStatus(),
                homework ? s.getAssignment().getId() : null,
                homework ? null : s.getQuiz().getId(),
                title,
                s.getCourse().getId(),
                s.getCourse().getName(),
                s.getStudent().getId(),
                s.getStudent().getUser().getFullName(),
                s.getScore(),
                s.getMaxScore(),
                percent(s.getScore(), s.getMaxScore()),
                s.getAttemptCount(),
                s.getSubmittedAt(),
                s.getGradedAt());
    }

    private static Double percent(BigDecimal score, BigDecimal maxScore) {
        if (score == null || maxScore == null || maxScore.signum() <= 0) {
            return null;
        }
        double pct = score.doubleValue() / maxScore.doubleValue() * 100.0;
        return Math.max(0, Math.min(100, pct));
    }
}
