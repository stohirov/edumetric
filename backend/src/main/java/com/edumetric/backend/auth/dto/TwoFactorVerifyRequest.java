package com.edumetric.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** Second login step: the MFA challenge token from /login plus a TOTP or backup code. */
public record TwoFactorVerifyRequest(@NotBlank String mfaToken, @NotBlank String code) {
}
