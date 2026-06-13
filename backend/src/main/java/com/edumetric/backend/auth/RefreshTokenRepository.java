package com.edumetric.backend.auth;

import com.edumetric.backend.auth.domain.RefreshToken;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** A user's still-valid sessions (not revoked, not expired), most recently used first. */
    @Query("SELECT t FROM RefreshToken t "
            + "WHERE t.userId = :userId AND t.revokedAt IS NULL AND t.expiresAt > :now "
            + "ORDER BY t.lastUsedAt DESC NULLS LAST, t.createdAt DESC")
    List<RefreshToken> findActiveByUser(@Param("userId") Long userId, @Param("now") Instant now);

    /** Paginated variant of {@link #findActiveByUser} for the sessions list endpoint. */
    @Query(value = "SELECT t FROM RefreshToken t "
            + "WHERE t.userId = :userId AND t.revokedAt IS NULL AND t.expiresAt > :now "
            + "ORDER BY t.lastUsedAt DESC NULLS LAST, t.createdAt DESC",
            countQuery = "SELECT COUNT(t) FROM RefreshToken t "
                    + "WHERE t.userId = :userId AND t.revokedAt IS NULL AND t.expiresAt > :now")
    Page<RefreshToken> findActiveByUser(
            @Param("userId") Long userId, @Param("now") Instant now, Pageable pageable);

    /** Scoped lookup so a user can only act on their own session. */
    Optional<RefreshToken> findByIdAndUserId(Long id, Long userId);

    /** Revoke every still-active token for a user (logout-all / reuse response). */
    @Modifying
    @Query("UPDATE RefreshToken t SET t.revokedAt = :now "
            + "WHERE t.userId = :userId AND t.revokedAt IS NULL")
    void revokeAllForUser(@Param("userId") Long userId, @Param("now") Instant now);
}
