package com.edumetric.backend.messaging;

import com.edumetric.backend.messaging.domain.Message;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findAllByConversationIdOrderByCreatedAtAsc(Long conversationId, Pageable pageable);

    long countByConversationIdAndSenderIdNotAndReadAtIsNull(Long conversationId, Long senderId);

    @Modifying
    @Query("UPDATE Message m SET m.readAt = :now "
            + "WHERE m.conversation.id = :conversationId AND m.sender.id <> :actorId AND m.readAt IS NULL")
    int markRead(
            @Param("conversationId") Long conversationId,
            @Param("actorId") Long actorId,
            @Param("now") Instant now);
}
