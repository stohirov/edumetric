package com.edumetric.backend.invitations.dto;

import com.edumetric.backend.users.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateInvitationRequest(
        @NotBlank @Email String email,
        @Size(max = 255) String fullName,
        @NotNull Role role,
        Long groupId
) {
}
