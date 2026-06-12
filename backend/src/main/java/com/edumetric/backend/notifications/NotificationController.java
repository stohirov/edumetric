package com.edumetric.backend.notifications;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.notifications.dto.NotificationDto;
import com.edumetric.backend.notifications.dto.UnreadCountDto;
import com.edumetric.backend.security.AuthenticatedUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** The signed-in user's most recent notifications (newest first). */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> list(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.list(principal)));
    }

    /** Unread count — polled by the header bell badge. */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UnreadCountDto>> unreadCount(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(new UnreadCountDto(notificationService.unreadCount(principal))));
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser principal) {
        notificationService.markRead(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        notificationService.markAllRead(principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
