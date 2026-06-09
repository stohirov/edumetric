package com.edumetric.backend.auth;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.users.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Brute-force protection: tracks consecutive failed logins per account and
 * temporarily locks the account once the threshold is reached. Lock state is
 * read at authentication time via {@code AuthenticatedUser#isAccountNonLocked()}.
 *
 * <p>Bookkeeping runs in its own transaction so it commits even when the
 * surrounding (non-transactional) login attempt ends in an authentication
 * exception. Unknown emails are silently ignored — we never reveal whether an
 * account exists.
 */
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    static final int MAX_ATTEMPTS = 5;
    static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    /** Clears the failure counter and records a successful login. */
    @Transactional
    public void onLoginSucceeded(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            if (user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
            }
            auditLogService.log("User", userId, "LOGIN", userId,
                    Map.of("email", user.getEmail()));
        });
    }

    /** Increments the failure counter and locks the account if the threshold is reached. */
    @Transactional
    public void onLoginFailed(String email) {
        Instant now = Instant.now();
        userRepository.findByEmail(email).ifPresent(user -> {
            int attempts = user.getFailedLoginAttempts();
            // A previously expired lock starts a fresh window rather than re-locking instantly.
            if (user.getLockedUntil() != null && user.getLockedUntil().isBefore(now)) {
                attempts = 0;
                user.setLockedUntil(null);
            }
            attempts += 1;
            user.setFailedLoginAttempts(attempts);
            auditLogService.log("User", user.getId(), "LOGIN_FAILED", user.getId(),
                    Map.of("email", email, "attempts", attempts));
            if (attempts >= MAX_ATTEMPTS) {
                user.setLockedUntil(now.plus(LOCK_DURATION));
                auditLogService.log("User", user.getId(), "ACCOUNT_LOCKED", user.getId(),
                        Map.of("email", email, "lockMinutes", LOCK_DURATION.toMinutes()));
            }
        });
    }

    /** Records an attempt against an account that is currently locked out. */
    @Transactional
    public void onLoginBlockedByLock(String email) {
        userRepository.findByEmail(email).ifPresent(user ->
                auditLogService.log("User", user.getId(), "LOGIN_FAILED", user.getId(),
                        Map.of("email", email, "reason", "locked")));
    }
}
