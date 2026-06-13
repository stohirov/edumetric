package com.edumetric.backend.invitations;

import com.edumetric.backend.invitations.domain.Invitation;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByTokenHash(String tokenHash);

    Page<Invitation> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
