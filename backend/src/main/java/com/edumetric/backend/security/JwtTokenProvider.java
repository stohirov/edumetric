package com.edumetric.backend.security;

import com.edumetric.backend.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    /** Claim + value marking a short-lived token that only authorizes the 2FA verify step. */
    public static final String SCOPE_CLAIM = "scope";
    public static final String MFA_SCOPE = "MFA";
    private static final Duration MFA_EXPIRATION = Duration.ofMinutes(5);

    private final SecretKey signingKey;
    @Getter
    private final Duration expiration;
    private final String issuer;

    public JwtTokenProvider(JwtProperties properties) {
        byte[] keyBytes = properties.secret().getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = Duration.ofMinutes(properties.expirationMinutes());
        this.issuer = properties.issuer();
    }

    /**
     * Mints a short-lived token issued after a correct password when 2FA is on.
     * It carries {@code scope=MFA} and is rejected by {@code JwtAuthenticationFilter}
     * for everything except the {@code /api/auth/2fa/verify} step.
     */
    public String generateMfaToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim(SCOPE_CLAIM, MFA_SCOPE)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(MFA_EXPIRATION)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public String generateToken(AuthenticatedUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(user.id()))
                .claim("email", user.email())
                .claim("role", user.role().name())
                .claim("name", user.fullName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
