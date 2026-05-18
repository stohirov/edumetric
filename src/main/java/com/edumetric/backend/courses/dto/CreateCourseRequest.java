package com.edumetric.backend.courses.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCourseRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 64) String code,
        String description
) {
}
