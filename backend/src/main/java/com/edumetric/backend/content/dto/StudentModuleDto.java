package com.edumetric.backend.content.dto;

import java.util.List;

/** A published module with its materials, as seen by a student. */
public record StudentModuleDto(
        Long id,
        String title,
        String summary,
        int position,
        // True when a prerequisite module is not yet fully completed — materials are gated.
        boolean locked,
        Long prerequisiteModuleId,
        List<StudentMaterialDto> materials) {
}
