package com.edumetric.backend.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Self-service profile update for the currently authenticated user.
 * Unlike {@link UpdateUserRequest} it cannot change the account role.
 * All fields are optional — only present fields are applied.
 */
public record UpdateProfileRequest(
        @Email @Size(max = 255) String email,
        @Size(min = 8, max = 200) String password,
        @Size(max = 255) String fullName,
        @Pattern(regexp = "uz|ru|en", message = "language must be one of: uz, ru, en") String language,
        Boolean notifyEmail,
        Boolean notifyInApp,
        @Size(max = 32)
        @Pattern(regexp = "[+0-9 ()\\-]*", message = "phone may only contain digits, spaces, and + ( ) -")
        String phone,
        @Size(max = 500) String address
) {
}
