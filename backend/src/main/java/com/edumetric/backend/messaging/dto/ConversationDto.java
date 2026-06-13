package com.edumetric.backend.messaging.dto;

import com.edumetric.backend.messaging.domain.Conversation;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;

public record ConversationDto(
        Long id,
        Long otherUserId,
        String otherUserName,
        String otherUserRole,
        Instant lastMessageAt,
        long unreadCount) {

    public static ConversationDto from(Conversation conversation, User other, long unreadCount) {
        return new ConversationDto(
                conversation.getId(),
                other.getId(),
                other.getFullName(),
                other.getRole().name(),
                conversation.getLastMessageAt(),
                unreadCount);
    }
}
