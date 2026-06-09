package com.edumetric.backend.auth.dto;

import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;

public record UserDto(
        Long id,
        String email,
        String fullName,
        Role role,
        String language,
        boolean notifyEmail,
        boolean notifyInApp,
        boolean mustChangePassword,
        boolean twoFactorEnabled
) {

    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getLanguage(),
                user.isNotifyEmail(),
                user.isNotifyInApp(),
                user.isMustChangePassword(),
                user.isTotpEnabled());
    }
}
