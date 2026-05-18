package com.edumetric.backend.auth.dto;

import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;

public record UserDto(Long id, String email, String fullName, Role role) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
