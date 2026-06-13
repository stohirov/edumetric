package com.edumetric.backend.submissions.domain;

/**
 * Lifecycle of a {@link Submission}. Homework is {@code SUBMITTED} until a
 * teacher posts a grade ({@code GRADED}); auto-graded quizzes are {@code GRADED}
 * the moment they are submitted.
 */
public enum SubmissionStatus {
    SUBMITTED,
    GRADED
}
