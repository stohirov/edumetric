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
