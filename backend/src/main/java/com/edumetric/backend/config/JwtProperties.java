package com.edumetric.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.jwt")
public record JwtProperties(
        String secret,
        long expirationMinutes,
        long refreshExpirationDays,
        String issuer
) {
}
