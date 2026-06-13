package com.edumetric.backend.messaging.dto;

import com.edumetric.backend.users.domain.User;

public record ContactDto(Long id, String fullName, String role) {

    public static ContactDto from(User user) {
        return new ContactDto(user.getId(), user.getFullName(), user.getRole().name());
    }
}
