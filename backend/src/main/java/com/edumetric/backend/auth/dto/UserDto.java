package com.edumetric.backend.auth.dto;

import com.edumetric.backend.users.domain.AccountStatus;
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
        boolean emailVerified,
        String phone,
        String address,
        String avatarUrl,
        AccountStatus status,
        String emergencyContact,
        Long departmentId
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
                user.isEmailVerified(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatarKey() != null ? AVATAR_PATH : null,
                user.getStatus(),
                user.getEmergencyContact(),
                user.getDepartmentId());
    }
}
