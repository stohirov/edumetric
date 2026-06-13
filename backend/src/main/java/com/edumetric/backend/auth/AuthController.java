package com.edumetric.backend.auth;

import com.edumetric.backend.auth.dto.AuthResult;
import com.edumetric.backend.auth.dto.DeviceInfo;
import com.edumetric.backend.auth.dto.ForgotPasswordRequest;
import com.edumetric.backend.auth.dto.LoginRequest;
import com.edumetric.backend.auth.dto.LoginResponse;
import com.edumetric.backend.auth.dto.RefreshRequest;
import com.edumetric.backend.auth.dto.ResendVerificationRequest;
import com.edumetric.backend.auth.dto.ResetPasswordRequest;
import com.edumetric.backend.auth.dto.SessionDto;
import com.edumetric.backend.auth.dto.TwoFactorVerifyRequest;
import com.edumetric.backend.auth.dto.VerifyEmailRequest;
import com.edumetric.backend.auth.dto.UserDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String COOKIE_NAME = "em_token";
    private static final String REFRESH_COOKIE_NAME = "em_refresh";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        AuthService.LoginOutcome outcome = authService.login(request, DeviceInfo.from(httpRequest));
        if (outcome.mfaRequired()) {
            // Password verified, but 2FA is on — no cookies yet; client must hit /2fa/verify.
            return ResponseEntity.ok(ApiResponse.ok(LoginResponse.mfaChallenge(outcome.mfaToken())));
        }
        writeAuthCookies(response, outcome.authResult());
        return ResponseEntity.ok(ApiResponse.ok(outcome.authResult().toLoginResponse()));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyTwoFactor(
            @Valid @RequestBody TwoFactorVerifyRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        AuthResult result = authService.completeMfaLogin(
                request.mfaToken(), request.code(), DeviceInfo.from(httpRequest));
        writeAuthCookies(response, result);
        return ResponseEntity.ok(ApiResponse.ok(result.toLoginResponse()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @RequestBody(required = false) RefreshRequest body,
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshCookie,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        String rawToken = body != null && StringUtils.hasText(body.refreshToken())
                ? body.refreshToken()
                : refreshCookie;
        AuthResult result = authService.refresh(rawToken, DeviceInfo.from(httpRequest));
        writeAuthCookies(response, result);
        return ResponseEntity.ok(ApiResponse.ok(result.toLoginResponse()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.email());
        // Always 200 — never reveal whether the email is registered.
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationService.verify(request.token());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerification(request.email());
        // Always 200 — never reveal whether the email is registered or already verified.
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(principal.id())));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<PageResponse<SessionDto>>> sessions(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshCookie,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.of(authService.listSessions(principal.id(), refreshCookie, pageable))));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable Long id) {
        authService.revokeSession(principal.id(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/sessions/revoke-others")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> revokeOtherSessions(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestBody(required = false) RefreshRequest body,
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshCookie) {
        String keep = body != null && StringUtils.hasText(body.refreshToken())
                ? body.refreshToken()
                : refreshCookie;
        int revoked = authService.revokeOtherSessions(principal.id(), keep);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("revoked", revoked)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshRequest body,
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshCookie,
            HttpServletResponse response) {
        String rawToken = body != null && StringUtils.hasText(body.refreshToken())
                ? body.refreshToken()
                : refreshCookie;
        authService.revokeRefreshToken(rawToken);
        response.addCookie(expiredCookie(COOKIE_NAME, "/"));
        response.addCookie(expiredCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH));
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    private void writeAuthCookies(HttpServletResponse response, AuthResult result) {
        Cookie access = new Cookie(COOKIE_NAME, result.accessToken());
        access.setHttpOnly(true);
        access.setPath("/");
        access.setMaxAge((int) result.accessExpiresInSeconds());
        response.addCookie(access);

        Cookie refresh = new Cookie(REFRESH_COOKIE_NAME, result.refreshToken());
        refresh.setHttpOnly(true);
        refresh.setPath(REFRESH_COOKIE_PATH);
        refresh.setMaxAge((int) result.refreshExpiresInSeconds());
        response.addCookie(refresh);
    }

    private Cookie expiredCookie(String name, String path) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setPath(path);
        cookie.setMaxAge(0);
        return cookie;
    }
}
