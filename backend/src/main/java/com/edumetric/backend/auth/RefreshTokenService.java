package com.edumetric.backend.auth;

import com.edumetric.backend.auth.domain.RefreshToken;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.config.JwtProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Issues, rotates and revokes opaque refresh tokens. Only the SHA-256 hash is
 * stored; the raw value is returned to the caller once. Tokens are single-use:
 * {@link #rotate} revokes the presented token and issues a fresh one, and
 * presenting an already-revoked token is treated as reuse — every token for that
 * user is revoked, forcing a full re-login.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    /** A freshly issued raw token plus its absolute expiry. */
    public record IssuedToken(String rawToken, Instant expiresAt) {}

    /** The user a rotated token belonged to, paired with its replacement. */
    public record RotationResult(Long userId, IssuedToken newToken) {}

    public Duration ttl() {
        return Duration.ofDays(jwtProperties.refreshExpirationDays());
    }

    /** Issues a new refresh token for the user. */
    @Transactional
    public IssuedToken issue(Long userId) {
        Instant now = Instant.now();
        String rawToken = generateToken();
        Instant expiresAt = now.plus(ttl());
        refreshTokenRepository.save(RefreshToken.builder()
                .userId(userId)
                .tokenHash(hash(rawToken))
                .expiresAt(expiresAt)
                .createdAt(now)
                .build());
        return new IssuedToken(rawToken, expiresAt);
    }

    /** Validates and rotates the presented token, returning the owner and a replacement. */
    @Transactional
    public RotationResult rotate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException("Missing refresh token.");
        }
        Instant now = Instant.now();
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("Invalid refresh token."));

        if (token.getRevokedAt() != null) {
            // Reuse of a rotated/revoked token — assume compromise and revoke the whole family.
            log.warn("Refresh token reuse detected for user {}; revoking all tokens", token.getUserId());
            refreshTokenRepository.revokeAllForUser(token.getUserId(), now);
            throw new BadRequestException("Invalid refresh token.");
        }
        if (token.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("Expired refresh token.");
        }

        token.setRevokedAt(now);
        IssuedToken replacement = issue(token.getUserId());
        return new RotationResult(token.getUserId(), replacement);
    }

    /** Revokes a single token (logout). No-op if the token is unknown or already revoked. */
    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .filter(t -> t.getRevokedAt() == null)
                .ifPresent(t -> t.setRevokedAt(Instant.now()));
    }

    /** Revokes every active token for a user (logout-all). */
    @Transactional
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.revokeAllForUser(userId, Instant.now());
    }

    private static String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
