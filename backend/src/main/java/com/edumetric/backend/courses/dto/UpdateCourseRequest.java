package com.edumetric.backend.courses.dto;

import jakarta.validation.constraints.Size;

public record UpdateCourseRequest(
        @Size(max = 255) String name,
        @Size(max = 64) String code,
        String description
) {
}
