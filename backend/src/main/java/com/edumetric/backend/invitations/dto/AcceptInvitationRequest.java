package com.edumetric.backend.invitations.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptInvitationRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 200) String password,
        @Size(max = 255) String fullName
) {
}
