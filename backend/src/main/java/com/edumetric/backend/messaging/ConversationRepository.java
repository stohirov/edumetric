package com.edumetric.backend.messaging;

import com.edumetric.backend.messaging.domain.Conversation;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.userA.id = :userAId AND c.userB.id = :userBId")
    Optional<Conversation> findByPair(@Param("userAId") Long userAId, @Param("userBId") Long userBId);

    @Query(value = "SELECT c FROM Conversation c WHERE c.userA.id = :userId OR c.userB.id = :userId "
            + "ORDER BY c.lastMessageAt DESC NULLS LAST",
            countQuery = "SELECT COUNT(c) FROM Conversation c "
                    + "WHERE c.userA.id = :userId OR c.userB.id = :userId")
    Page<Conversation> findAllForUser(@Param("userId") Long userId, Pageable pageable);
}
