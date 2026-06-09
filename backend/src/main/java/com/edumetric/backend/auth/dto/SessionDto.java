package com.edumetric.backend.auth.dto;

import com.edumetric.backend.auth.domain.RefreshToken;
import java.time.Instant;

/**
 * A user-visible active session, backed by one non-revoked refresh token.
 * {@code current} marks the session making the request.
 */
public record SessionDto(
        Long id,
        boolean current,
        String userAgent,
        String ipAddress,
        Instant createdAt,
        Instant lastUsedAt,
        Instant expiresAt) {

    public static SessionDto from(RefreshToken token, boolean current) {
        return new SessionDto(
                token.getId(),
                current,
                token.getUserAgent(),
                token.getIpAddress(),
                token.getCreatedAt(),
                token.getLastUsedAt(),
                token.getExpiresAt());
    }
}
