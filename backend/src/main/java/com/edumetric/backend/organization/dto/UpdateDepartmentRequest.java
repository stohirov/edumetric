package com.edumetric.backend.organization.dto;

import jakarta.validation.constraints.Size;

public record UpdateDepartmentRequest(
        @Size(max = 255) String name,
        @Size(max = 32) String code,
        String description
) {
}
