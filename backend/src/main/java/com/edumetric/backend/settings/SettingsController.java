package com.edumetric.backend.settings;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.settings.dto.InstitutionSettingsDto;
import com.edumetric.backend.settings.dto.UpdateInstitutionSettingsRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Institution-wide settings. Readable by any authenticated user (so the UI can
 * apply branding / locale defaults); only ADMIN may modify.
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<InstitutionSettingsDto>> get() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getSettings()));
    }

    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InstitutionSettingsDto>> update(
            @Valid @RequestBody UpdateInstitutionSettingsRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.updateSettings(request, actor)));
    }
}
