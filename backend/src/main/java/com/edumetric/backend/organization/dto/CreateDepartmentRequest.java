package com.edumetric.backend.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDepartmentRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 32) String code,
        String description
) {
}
