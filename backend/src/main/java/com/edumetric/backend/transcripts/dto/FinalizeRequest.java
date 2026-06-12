package com.edumetric.backend.transcripts.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request to finalize term grades. When {@code studentId} is null, every student
 * enrolled in the course is finalized; otherwise only that single student.
 */
public record FinalizeRequest(
        @NotNull Long courseId,
        @NotNull Long termId,
        Long studentId) {}
