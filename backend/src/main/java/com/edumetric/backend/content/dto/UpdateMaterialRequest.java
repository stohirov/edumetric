package com.edumetric.backend.content.dto;

import com.edumetric.backend.content.domain.MaterialType;

public record UpdateMaterialRequest(
        String title,
        MaterialType type,
        String content,
        String url,
        Integer position,
        Boolean published
) {
}
