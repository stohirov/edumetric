package com.edumetric.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** A TOTP (or backup) code submitted to enable or disable 2FA. */
public record TwoFactorCodeRequest(@NotBlank String code) {
}
