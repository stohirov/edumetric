package com.edumetric.backend.homework.domain;

/** Lifecycle of a piece of homework from the student's perspective. */
public enum HomeworkStatus {
    /** Nothing submitted yet and not graded. */
    PENDING,
    /** The student has uploaded/commented but it has not been graded. */
    SUBMITTED,
    /** A grade exists for this assignment. */
    GRADED
}
