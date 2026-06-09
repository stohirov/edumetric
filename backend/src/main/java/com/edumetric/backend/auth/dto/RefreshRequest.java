package com.edumetric.backend.auth.dto;

/**
 * Optional body for {@code /api/auth/refresh} and {@code /api/auth/logout}.
 * The refresh token may instead arrive via the {@code em_refresh} cookie.
 */
public record RefreshRequest(String refreshToken) {
}
