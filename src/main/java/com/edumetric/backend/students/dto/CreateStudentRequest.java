package com.edumetric.backend.students.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateStudentRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 200) String password,
        @NotBlank @Size(max = 255) String fullName,
        @NotNull Long groupId,
        LocalDate enrolledAt
) {
}
