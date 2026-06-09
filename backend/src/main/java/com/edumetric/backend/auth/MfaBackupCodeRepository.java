package com.edumetric.backend.auth;

import com.edumetric.backend.auth.domain.MfaBackupCode;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MfaBackupCodeRepository extends JpaRepository<MfaBackupCode, Long> {

    List<MfaBackupCode> findByUserIdAndUsedAtIsNull(Long userId);

    Optional<MfaBackupCode> findByUserIdAndCodeHashAndUsedAtIsNull(Long userId, String codeHash);

    @Modifying
    @Query("DELETE FROM MfaBackupCode c WHERE c.userId = :userId")
    void deleteAllForUser(@Param("userId") Long userId);
}
