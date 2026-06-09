package com.edumetric.backend.auth;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.auth.domain.PasswordResetToken;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Token-based password reset. The raw token is generated once, hashed, and the
 * hash stored; the raw value is delivered to the user out-of-band. Email
 * delivery is not wired yet (see TODO §7), so in dev the raw token is logged.
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);
    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final PasswordPolicy passwordPolicy;

    /**
     * Issues a reset token for the account if one exists. Always succeeds from the
     * caller's perspective — we never reveal whether the email is registered.
     */
    @Transactional
    public void requestReset(String email) {
        Instant now = Instant.now();
        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            tokenRepository.invalidateActiveTokens(user.getId(), now);
            String rawToken = generateToken();
            tokenRepository.save(PasswordResetToken.builder()
                    .userId(user.getId())
                    .tokenHash(hash(rawToken))
                    .expiresAt(now.plus(TOKEN_TTL))
                    .createdAt(now)
                    .build());
            auditLogService.log("User", user.getId(), "PASSWORD_RESET_REQUEST", user.getId(),
                    Map.of("email", user.getEmail()));
            // TODO §7: deliver via email. Until then, log the token for dev delivery.
            log.info("Password reset requested for {} — token (valid {} min): {}",
                    user.getEmail(), TOKEN_TTL.toMinutes(), rawToken);
        }, () -> log.info("Password reset requested for unknown email: {}", email));
    }

    /** Consumes a reset token and sets the new password. Throws on invalid/expired/used tokens. */
    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        passwordPolicy.validate(newPassword);
        Instant now = Instant.now();
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .filter(t -> t.getUsedAt() == null && t.getExpiresAt().isAfter(now))
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token."));

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        // A self-chosen password clears any pending forced-change requirement.
        user.setMustChangePassword(false);
        token.setUsedAt(now);
        // Invalidate any other outstanding tokens for this user.
        tokenRepository.invalidateActiveTokens(user.getId(), now);

        auditLogService.log("User", user.getId(), "PASSWORD_RESET", user.getId(),
                Map.of("email", user.getEmail()));
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
