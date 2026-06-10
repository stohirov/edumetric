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
        boolean twoFactorEnabled,
        String phone,
        String address,
        String avatarUrl
) {

    /** Relative API path the client fetches the avatar image from (under the /api base). */
    private static final String AVATAR_PATH = "/profile/avatar";

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
                user.isTotpEnabled(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatarKey() != null ? AVATAR_PATH : null);
    }
}
