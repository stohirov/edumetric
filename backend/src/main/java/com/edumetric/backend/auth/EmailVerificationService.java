package com.edumetric.backend.auth;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.auth.domain.EmailVerificationToken;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.users.UserRepository;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Token-based email verification. Mirrors {@link PasswordResetService}: a raw
 * token is generated once, hashed, and only the hash stored; the raw value is
 * delivered to the user out-of-band. Email delivery is not wired yet (see
 * TODO §7), so in dev the raw token is logged. Verification is currently
 * non-blocking — accounts can sign in before verifying — but the state is
 * surfaced so the UI can nudge the owner to confirm their address.
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);
    private static final Duration TOKEN_TTL = Duration.ofHours(24);
    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final AuditLogService auditLogService;

    /**
     * Issues a verification token for a freshly created account. Invoked from the
     * same transaction that creates the user, so the user is already persisted.
     */
    @Transactional
    public void issueForNewUser(User user) {
        if (user.isEmailVerified()) {
            return;
        }
        sendToken(user);
    }

    /**
     * Re-issues a verification token for the account if one exists and is still
     * unverified. Always succeeds from the caller's perspective — we never reveal
     * whether the email is registered or already verified.
     */
    @Transactional
    public void resendVerification(String email) {
        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            if (user.isEmailVerified()) {
                log.info("Verification resend requested for already-verified account: {}", email);
                return;
            }
            sendToken(user);
        }, () -> log.info("Verification resend requested for unknown email: {}", email));
    }

    /** Consumes a verification token and marks the email verified. Throws on invalid/expired/used tokens. */
    @Transactional
    public void verify(String rawToken) {
        Instant now = Instant.now();
        EmailVerificationToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .filter(t -> t.getUsedAt() == null && t.getExpiresAt().isAfter(now))
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token."));

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token."));

        user.setEmailVerified(true);
        token.setUsedAt(now);
        // Invalidate any other outstanding tokens for this user.
        tokenRepository.invalidateActiveTokens(user.getId(), now);

        auditLogService.log("User", user.getId(), "EMAIL_VERIFIED", user.getId(),
                Map.of("email", user.getEmail()));
    }

    private void sendToken(User user) {
        Instant now = Instant.now();
        tokenRepository.invalidateActiveTokens(user.getId(), now);
        String rawToken = generateToken();
        tokenRepository.save(EmailVerificationToken.builder()
                .userId(user.getId())
                .tokenHash(hash(rawToken))
                .expiresAt(now.plus(TOKEN_TTL))
                .createdAt(now)
                .build());
        auditLogService.log("User", user.getId(), "EMAIL_VERIFICATION_REQUEST", user.getId(),
                Map.of("email", user.getEmail()));
        // TODO §7: deliver via email. Until then, log the token for dev delivery.
        log.info("Email verification requested for {} — token (valid {} h): {}",
                user.getEmail(), TOKEN_TTL.toHours(), rawToken);
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
