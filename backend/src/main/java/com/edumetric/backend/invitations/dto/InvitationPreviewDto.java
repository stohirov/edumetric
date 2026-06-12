package com.edumetric.backend.invitations.dto;

import com.edumetric.backend.invitations.domain.Invitation;
import com.edumetric.backend.users.domain.Role;

/** Public, minimal view shown on the accept page before the invitee sets a password. */
public record InvitationPreviewDto(
        String email,
        String fullName,
        Role role) {

    public static InvitationPreviewDto from(Invitation invitation) {
        return new InvitationPreviewDto(
                invitation.getEmail(),
                invitation.getFullName(),
                invitation.getRole());
    }
}
