package com.edumetric.backend.auth;

import com.edumetric.backend.auth.dto.TwoFactorCodeRequest;
import com.edumetric.backend.auth.dto.TwoFactorEnabledResponse;
import com.edumetric.backend.auth.dto.TwoFactorSetupResponse;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Self-service TOTP two-factor management for the authenticated user. The login
 * verify step lives in {@link AuthController} since it issues session cookies.
 */
@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
public class TwoFactorController {

    private final TwoFactorService twoFactorService;

    /** Begin setup: returns a pending secret + otpauth URI to render as a QR code. */
    @PostMapping("/setup")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> setup(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(twoFactorService.beginSetup(principal.id())));
    }

    /** Confirm the first code, activate 2FA, and reveal one-time backup codes. */
    @PostMapping("/enable")
    public ResponseEntity<ApiResponse<TwoFactorEnabledResponse>> enable(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody TwoFactorCodeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(twoFactorService.enable(principal.id(), request.code())));
    }

    /** Turn 2FA off after re-verifying with a TOTP or backup code. */
    @PostMapping("/disable")
    public ResponseEntity<ApiResponse<Void>> disable(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody TwoFactorCodeRequest request) {
        twoFactorService.disable(principal.id(), request.code());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
