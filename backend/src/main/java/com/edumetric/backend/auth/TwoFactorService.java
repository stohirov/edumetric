package com.edumetric.backend.auth;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.auth.domain.MfaBackupCode;
import com.edumetric.backend.auth.dto.TwoFactorEnabledResponse;
import com.edumetric.backend.auth.dto.TwoFactorSetupResponse;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orchestrates TOTP two-factor auth: setup/enable/disable and login-time code
 * verification (accepting either a TOTP code or a one-time backup code). Code
 * checking lives here so {@code AuthService} can depend on it without a cycle.
 */
@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private static final String ISSUER = "EduMetric";
    private static final int BACKUP_CODE_COUNT = 10;
    // Unambiguous alphabet (no 0/o/1/l) for hand-typed recovery codes.
    private static final String BACKUP_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
    private static final int BACKUP_CODE_LEN = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final MfaBackupCodeRepository backupCodeRepository;
    private final TotpService totpService;
    private final AuditLogService auditLogService;

    /** Generates a pending secret and its provisioning URI. 2FA stays off until {@link #enable}. */
    @Transactional
    public TwoFactorSetupResponse beginSetup(Long userId) {
        User user = loadUser(userId);
        String secret = totpService.generateSecret();
        user.setTotpSecret(secret);
        user.setTotpEnabled(false);
        return new TwoFactorSetupResponse(secret, totpService.provisioningUri(secret, ISSUER, user.getEmail()));
    }

    /** Verifies the first TOTP code, activates 2FA, and returns fresh one-time backup codes. */
    @Transactional
    public TwoFactorEnabledResponse enable(Long userId, String code) {
        User user = loadUser(userId);
        if (user.getTotpSecret() == null) {
            throw new BadRequestException("Start two-factor setup first.");
        }
        if (user.isTotpEnabled()) {
            throw new BadRequestException("Two-factor authentication is already enabled.");
        }
        if (!totpService.verifyCode(user.getTotpSecret(), code)) {
            throw new BadRequestException("Invalid authentication code.");
        }
        user.setTotpEnabled(true);
        List<String> codes = regenerateBackupCodes(userId);
        auditLogService.log("User", userId, "MFA_ENABLED", userId, Map.of("email", user.getEmail()));
        return new TwoFactorEnabledResponse(codes);
    }

    /** Turns 2FA off after re-verifying the owner (TOTP or backup code), clearing all secrets. */
    @Transactional
    public void disable(Long userId, String code) {
        User user = loadUser(userId);
        if (!user.isTotpEnabled()) {
            throw new BadRequestException("Two-factor authentication is not enabled.");
        }
        if (!verifyAnyCode(user, code)) {
            throw new BadRequestException("Invalid authentication code.");
        }
        user.setTotpSecret(null);
        user.setTotpEnabled(false);
        backupCodeRepository.deleteAllForUser(userId);
        auditLogService.log("User", userId, "MFA_DISABLED", userId, Map.of("email", user.getEmail()));
    }

    /** Login second step: throws unless the code is a valid TOTP or unused backup code. */
    @Transactional
    public void verifyLoginCode(Long userId, String code) {
        User user = loadUser(userId);
        if (!user.isTotpEnabled()) {
            throw new BadRequestException("Two-factor authentication is not enabled.");
        }
        if (!verifyAnyCode(user, code)) {
            throw new BadRequestException("Invalid authentication code.");
        }
    }

    private boolean verifyAnyCode(User user, String code) {
        if (totpService.verifyCode(user.getTotpSecret(), code)) {
            return true;
        }
        return consumeBackupCode(user.getId(), code);
    }

    private boolean consumeBackupCode(Long userId, String code) {
        String normalized = normalizeBackup(code);
        if (normalized.isEmpty()) {
            return false;
        }
        return backupCodeRepository.findByUserIdAndCodeHashAndUsedAtIsNull(userId, sha256(normalized))
                .map(c -> {
                    c.setUsedAt(Instant.now());
                    return true;
                })
                .orElse(false);
    }

    private List<String> regenerateBackupCodes(Long userId) {
        backupCodeRepository.deleteAllForUser(userId);
        Instant now = Instant.now();
        List<String> plain = new ArrayList<>(BACKUP_CODE_COUNT);
        for (int i = 0; i < BACKUP_CODE_COUNT; i++) {
            String raw = randomBackupCode();
            plain.add(raw);
            backupCodeRepository.save(MfaBackupCode.builder()
                    .userId(userId)
                    .codeHash(sha256(normalizeBackup(raw)))
                    .createdAt(now)
                    .build());
        }
        return plain;
    }

    private static String randomBackupCode() {
        StringBuilder sb = new StringBuilder(BACKUP_CODE_LEN + 1);
        for (int i = 0; i < BACKUP_CODE_LEN; i++) {
            if (i == BACKUP_CODE_LEN / 2) {
                sb.append('-');
            }
            sb.append(BACKUP_ALPHABET.charAt(RANDOM.nextInt(BACKUP_ALPHABET.length())));
        }
        return sb.toString();
    }

    private static String normalizeBackup(String code) {
        return code == null ? "" : code.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    private User loadUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }

    private static String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
