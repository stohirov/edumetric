package com.edumetric.backend.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateModuleRequest(
        @NotNull Long courseId,
        @NotBlank String title,
        String summary,
        Integer position,
        Boolean published,
        Long prerequisiteModuleId
) {
}
