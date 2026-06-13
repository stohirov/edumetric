package com.edumetric.backend.messaging.dto;

import com.edumetric.backend.messaging.domain.Message;
import java.time.Instant;

public record MessageDto(
        Long id,
        Long conversationId,
        Long senderId,
        String senderName,
        boolean mine,
        String body,
        Instant createdAt,
        Instant readAt) {

    public static MessageDto from(Message message, Long actorId) {
        return new MessageDto(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getSender().getId().equals(actorId),
                message.getBody(),
                message.getCreatedAt(),
                message.getReadAt());
    }
}
