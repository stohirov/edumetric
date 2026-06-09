package com.edumetric.backend.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Long-lived, rotating refresh token backing silent re-auth. Only the SHA-256
 * hash of the raw token is persisted. Each token is single-use: rotating or
 * logging out sets {@code revokedAt}, and presenting an already-revoked token
 * is treated as reuse (all of the user's tokens are then revoked).
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /** When the token was last presented (issued or rotated). Drives session "last active". */
    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    /** Raw User-Agent of the device that obtained the token; null for legacy rows. */
    @Column(name = "user_agent", length = 512)
    private String userAgent;

    /** Originating IP (X-Forwarded-For first hop, else remote addr); null for legacy rows. */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
}
