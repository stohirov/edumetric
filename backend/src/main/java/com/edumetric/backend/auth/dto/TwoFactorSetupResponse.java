package com.edumetric.backend.auth.dto;

/** Returned when a user begins 2FA setup: the pending secret and its QR provisioning URI. */
public record TwoFactorSetupResponse(String secret, String otpauthUri) {
}
