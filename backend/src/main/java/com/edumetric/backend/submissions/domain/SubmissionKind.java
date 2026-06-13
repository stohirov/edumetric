package com.edumetric.backend.submissions.domain;

/**
 * What a unified {@link Submission} represents — the two student-facing surfaces
 * that produce a mark: an uploaded homework {@code HOMEWORK} or an auto-graded
 * {@code QUIZ} attempt.
 */
public enum SubmissionKind {
    HOMEWORK,
    QUIZ
}
