package com.edumetric.backend.teachers.dto;

import jakarta.validation.constraints.Size;

public record UpdateTeacherRequest(
        @Size(max = 255) String fullName,
        @Size(max = 128) String department
) {
}
