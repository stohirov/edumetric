package com.edumetric.backend.plagiarism.dto;

import jakarta.validation.constraints.NotNull;

/** One student's text submission for an assignment, supplied to a plagiarism check. */
public record SubmissionText(@NotNull Long studentId, String text) {}
