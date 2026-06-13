package com.edumetric.backend.invitations;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.invitations.domain.Invitation;
import com.edumetric.backend.invitations.domain.InvitationStatus;
import com.edumetric.backend.invitations.dto.AcceptInvitationRequest;
import com.edumetric.backend.invitations.dto.CreateInvitationRequest;
import com.edumetric.backend.invitations.dto.InvitationDto;
import com.edumetric.backend.invitations.dto.InvitationPreviewDto;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.teachers.domain.Teacher;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Invitation / self-registration flow. An admin invites a person by email+role;
 * the invitee follows a tokenised link and sets their own password to create
 * their account. Mirrors {@code PasswordResetService}: a raw token is generated
 * once, hashed, and only the hash stored; the raw value is returned on create
 * (and logged) for dev delivery since email isn't wired app-wide yet.
 */
@Service
@RequiredArgsConstructor
public class InvitationService {

    private static final Logger log = LoggerFactory.getLogger(InvitationService.class);
    private static final Duration TOKEN_TTL = Duration.ofDays(7);
    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    /** Issues a new invitation. The returned DTO carries the raw token exactly once. */
    @Transactional
    public InvitationDto create(CreateInvitationRequest request, Long actorUserId) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        if (request.role() == Role.STUDENT && request.groupId() == null) {
            throw new BadRequestException("groupId is required for STUDENT invitations.");
        }

        Instant now = Instant.now();
        String rawToken = generateToken();
        Invitation invitation = invitationRepository.save(Invitation.builder()
                .email(request.email())
                .fullName(request.fullName())
                .role(request.role())
                .groupId(request.groupId())
                .tokenHash(hash(rawToken))
                .status(InvitationStatus.PENDING)
                .expiresAt(now.plus(TOKEN_TTL))
                .createdByUserId(actorUserId)
                .createdAt(now)
                .build());

        auditLogService.log("Invitation", invitation.getId(), "INVITATION_CREATED", actorUserId,
                Map.of("email", invitation.getEmail(), "role", invitation.getRole().name()));
        // TODO §7: deliver via email. Until then, log + return the token for dev delivery.
        log.info("Invitation created for {} (role {}) — token (valid {} days): {}",
                invitation.getEmail(), invitation.getRole(), TOKEN_TTL.toDays(), rawToken);

        return InvitationDto.from(invitation, rawToken);
    }

    /** All invitations, newest first. Raw token is never exposed here. */
    @Transactional(readOnly = true)
    public Page<InvitationDto> list(Pageable pageable) {
        return invitationRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(InvitationDto::from);
    }

    @Transactional
    public void revoke(Long id, Long actorUserId) {
        Invitation invitation = invitationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Invitation", id));
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Only a pending invitation can be revoked.");
        }
        invitation.setStatus(InvitationStatus.REVOKED);
        auditLogService.log("Invitation", invitation.getId(), "INVITATION_REVOKED", actorUserId,
                Map.of("email", invitation.getEmail()));
    }

    /** Public preview shown before the invitee chooses a password. */
    @Transactional(readOnly = true)
    public InvitationPreviewDto preview(String rawToken) {
        Invitation invitation = invitationRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found."));
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("This invitation is no longer valid.");
        }
        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("This invitation has expired.");
        }
        return InvitationPreviewDto.from(invitation);
    }

    /** Public: consumes the invitation and provisions the account with a self-chosen password. */
    @Transactional
    public void accept(AcceptInvitationRequest request) {
        Instant now = Instant.now();
        Invitation invitation = invitationRepository.findByTokenHash(hash(request.token()))
                .orElseThrow(() -> new BadRequestException("Invalid or expired invitation token."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("This invitation is no longer valid.");
        }
        if (invitation.getExpiresAt().isBefore(now)) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            throw new BadRequestException("This invitation has expired.");
        }
        if (userRepository.existsByEmail(invitation.getEmail())) {
            throw new ConflictException("Email already in use: " + invitation.getEmail());
        }

        // The invitee may supply/override their display name on the accept page.
        String fullName = StringUtils.hasText(request.fullName())
                ? request.fullName()
                : invitation.getFullName();
        if (!StringUtils.hasText(fullName)) {
            throw new BadRequestException("fullName is required.");
        }

        User user = userRepository.save(User.builder()
                .email(invitation.getEmail())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(fullName)
                .role(invitation.getRole())
                // They proved ownership of the email by following the invite link.
                .emailVerified(true)
                .mustChangePassword(false)
                .build());

        switch (invitation.getRole()) {
            case STUDENT -> {
                if (invitation.getGroupId() == null) {
                    throw new BadRequestException("This student invitation has no group assigned.");
                }
                Group group = groupRepository.findById(invitation.getGroupId())
                        .orElseThrow(() -> ResourceNotFoundException.of("Group", invitation.getGroupId()));
                studentRepository.save(Student.builder()
                        .user(user)
                        .group(group)
                        .build());
            }
            case TEACHER -> teacherRepository.save(Teacher.builder()
                    .user(user)
                    .build());
            case ADMIN, PARENT -> {
                // No extra profile row — the User record is sufficient.
            }
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(now);

        auditLogService.log("Invitation", invitation.getId(), "INVITATION_ACCEPTED", user.getId(),
                Map.of("email", invitation.getEmail(), "userId", user.getId()));
    }

    private static String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
