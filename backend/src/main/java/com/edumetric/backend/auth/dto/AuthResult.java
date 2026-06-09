package com.edumetric.backend.auth.dto;

/**
 * Internal carrier returned by {@code AuthService} for both login and refresh.
 * Holds the freshly minted access token alongside the rotating refresh token so
 * the controller can set cookies and shape the {@link LoginResponse} body.
 */
public record AuthResult(
        String accessToken,
        long accessExpiresInSeconds,
        String refreshToken,
        long refreshExpiresInSeconds,
        UserDto user
) {

    public LoginResponse toLoginResponse() {
        return new LoginResponse(accessToken, accessExpiresInSeconds, refreshToken, user, false, null);
    }
}
