package com.edumetric.backend.invitations.dto;

import com.edumetric.backend.invitations.domain.Invitation;
import com.edumetric.backend.invitations.domain.InvitationStatus;
import com.edumetric.backend.users.domain.Role;
import java.time.Instant;

/**
 * Invitation view. The raw {@code token} is populated ONLY on the create
 * response (so the admin/dev can build the accept link) and is {@code null}
 * everywhere else — it is never persisted in raw form.
 */
public record InvitationDto(
        Long id,
        String email,
        String fullName,
        Role role,
        Long groupId,
        InvitationStatus status,
        Instant expiresAt,
        Instant acceptedAt,
        Instant createdAt,
        String token) {

    /** List/detail view without the raw token. */
    public static InvitationDto from(Invitation invitation) {
        return from(invitation, null);
    }

    /** Create view that exposes the raw token exactly once. */
    public static InvitationDto from(Invitation invitation, String rawToken) {
        return new InvitationDto(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getFullName(),
                invitation.getRole(),
                invitation.getGroupId(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getAcceptedAt(),
                invitation.getCreatedAt(),
                rawToken);
    }
}
