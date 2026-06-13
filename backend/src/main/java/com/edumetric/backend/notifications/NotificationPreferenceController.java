package com.edumetric.backend.notifications;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.notifications.dto.NotificationPreferenceDto;
import com.edumetric.backend.notifications.dto.UpdateNotificationPreferenceRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationPreferenceDto>>> list(
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(preferenceService.list(actor)));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationPreferenceDto>> update(
            @Valid @RequestBody UpdateNotificationPreferenceRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(preferenceService.update(request, actor)));
    }
}
