package com.edumetric.backend.students.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateStudentRequest(
        @Size(max = 255) String fullName,
        Long groupId,
        LocalDate enrolledAt
) {
}
