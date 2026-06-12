package com.edumetric.backend.syllabus.dto;

import jakarta.validation.constraints.NotNull;

public record UpsertSyllabusRequest(
        @NotNull Long courseId,
        String objectives,
        String outline,
        Boolean published
) {
}
