package com.edumetric.backend.auth;

import com.edumetric.backend.auth.dto.AuthResult;
import com.edumetric.backend.auth.dto.DeviceInfo;
import com.edumetric.backend.auth.dto.LoginRequest;
import com.edumetric.backend.auth.dto.SessionDto;
import com.edumetric.backend.auth.dto.UserDto;
import java.util.List;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.JwtTokenProvider;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final LoginAttemptService loginAttemptService;
    private final RefreshTokenService refreshTokenService;

    /**
     * Authenticates the credentials and issues an access JWT plus a refresh token.
     * Failed attempts and lockout state are tracked by {@link LoginAttemptService}
     * in their own transactions, so this method intentionally runs without a
     * surrounding transaction.
     */
    public AuthResult login(LoginRequest request, DeviceInfo device) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (LockedException ex) {
            loginAttemptService.onLoginBlockedByLock(request.email());
            throw ex;
        } catch (BadCredentialsException ex) {
            loginAttemptService.onLoginFailed(request.email());
            throw ex;
        }

        AuthenticatedUser principal = (AuthenticatedUser) auth.getPrincipal();
        loginAttemptService.onLoginSucceeded(principal.id());

        User user = userRepository.findById(principal.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", principal.id()));
        RefreshTokenService.IssuedToken refresh = refreshTokenService.issue(user.getId(), device);
        return buildResult(user, refresh.rawToken());
    }

    /**
     * Rotates the presented refresh token and mints a fresh access JWT. The old
     * refresh token is single-use — reuse of a revoked token revokes the family.
     */
    public AuthResult refresh(String rawRefreshToken, DeviceInfo device) {
        RefreshTokenService.RotationResult rotation = refreshTokenService.rotate(rawRefreshToken, device);
        User user = userRepository.findById(rotation.userId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", rotation.userId()));
        return buildResult(user, rotation.newToken().rawToken());
    }

    /** Revokes the presented refresh token (logout). */
    public void revokeRefreshToken(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    /** Lists the user's active sessions, flagging the caller's current one. */
    public List<SessionDto> listSessions(Long userId, String currentRawToken) {
        return refreshTokenService.listSessions(userId, currentRawToken);
    }

    /** Revokes one of the user's sessions by id. Returns false if it wasn't found. */
    public boolean revokeSession(Long userId, Long sessionId) {
        return refreshTokenService.revokeSession(userId, sessionId);
    }

    /** Revokes all of the user's sessions except the caller's current one. */
    public int revokeOtherSessions(Long userId, String keepRawToken) {
        return refreshTokenService.revokeOtherSessions(userId, keepRawToken);
    }

    private AuthResult buildResult(User user, String rawRefreshToken) {
        String accessToken = tokenProvider.generateToken(AuthenticatedUser.from(user));
        return new AuthResult(
                accessToken,
                tokenProvider.getExpiration().toSeconds(),
                rawRefreshToken,
                refreshTokenService.ttl().toSeconds(),
                UserDto.from(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }
}
