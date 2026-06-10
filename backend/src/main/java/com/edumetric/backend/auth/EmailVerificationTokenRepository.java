package com.edumetric.backend.auth;

import com.edumetric.backend.auth.domain.EmailVerificationToken;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmailVerificationTokenRepository
        extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    /** Mark every still-active token for a user as used, so only the newest one is valid. */
    @Modifying
    @Query("UPDATE EmailVerificationToken t SET t.usedAt = :now "
            + "WHERE t.userId = :userId AND t.usedAt IS NULL")
    void invalidateActiveTokens(@Param("userId") Long userId, @Param("now") Instant now);
}
