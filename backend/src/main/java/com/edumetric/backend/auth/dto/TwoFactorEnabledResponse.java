package com.edumetric.backend.auth.dto;

import java.util.List;

/** Returned once 2FA is enabled: the one-time backup codes shown to the user exactly once. */
public record TwoFactorEnabledResponse(List<String> backupCodes) {
}
