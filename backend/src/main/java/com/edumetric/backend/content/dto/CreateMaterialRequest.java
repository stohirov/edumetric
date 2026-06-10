package com.edumetric.backend.content.dto;

import com.edumetric.backend.content.domain.MaterialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMaterialRequest(
        @NotBlank String title,
        @NotNull MaterialType type,
        String content,
        String url,
        Integer position,
        Boolean published
) {
}
