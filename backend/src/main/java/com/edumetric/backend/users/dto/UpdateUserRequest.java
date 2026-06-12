package com.edumetric.backend.users.dto;

import com.edumetric.backend.users.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Email @Size(max = 255) String email,
        @Size(min = 8, max = 200) String password,
        @Size(max = 255) String fullName,
        Role role,
        @Size(max = 500) String emergencyContact,
        Long departmentId
) {
}
