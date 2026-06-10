package com.edumetric.backend.quizzes.domain;

/** Determines how a question is answered and auto-graded. */
public enum QuestionType {
    /** Exactly one correct option. */
    SINGLE_CHOICE,
    /** Any number of correct options; full credit requires the exact correct set. */
    MULTIPLE_CHOICE,
    /** A SINGLE_CHOICE specialisation with two options (true/false). */
    TRUE_FALSE,
    /** Free text matched case-insensitively against accepted answers (stored as options). */
    SHORT_ANSWER
}
