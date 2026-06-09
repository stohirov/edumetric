package com.edumetric.backend.auth.dto;

/**
 * Login / refresh response body. On the normal path {@code token}, {@code refreshToken}
 * and {@code user} are populated. When the account has 2FA enabled the password step
 * returns {@code mfaRequired=true} plus a short-lived {@code mfaToken}; the client then
 * completes login via {@code /api/auth/2fa/verify}.
 */
public record LoginResponse(
        String token,
        long expiresInSeconds,
        String refreshToken,
        UserDto user,
        boolean mfaRequired,
        String mfaToken) {

    public static LoginResponse mfaChallenge(String mfaToken) {
        return new LoginResponse(null, 0, null, null, true, mfaToken);
    }
}
