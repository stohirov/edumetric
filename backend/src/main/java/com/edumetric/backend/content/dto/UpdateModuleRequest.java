package com.edumetric.backend.content.dto;

public record UpdateModuleRequest(
        String title,
        String summary,
        Integer position,
        Boolean published
) {
}
