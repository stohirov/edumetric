package com.edumetric.backend.gradebook.dto;

/**
 * What a gradebook column is backed by. {@code ASSIGNMENT} columns are
 * teacher-graded (editable inline); {@code QUIZ} columns are auto-graded from a
 * student's best {@code QuizAttempt} and are read-only in the matrix.
 */
public enum GradebookColumnKind {
    ASSIGNMENT,
    QUIZ
}
