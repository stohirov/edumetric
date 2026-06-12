package com.edumetric.backend.content.dto;

public record UpdateModuleRequest(
        String title,
        String summary,
        Integer position,
        Boolean published,
        // 0 clears the prerequisite; a positive id sets it.
        Long prerequisiteModuleId
) {
}
