package com.edumetric.backend.auth.dto;

public record LoginResponse(String token, long expiresInSeconds, UserDto user) {
}
