package com.edumetric.backend.invitations;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.invitations.dto.AcceptInvitationRequest;
import com.edumetric.backend.invitations.dto.CreateInvitationRequest;
import com.edumetric.backend.invitations.dto.InvitationDto;
import com.edumetric.backend.invitations.dto.InvitationPreviewDto;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvitationDto>> create(
            @Valid @RequestBody CreateInvitationRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(invitationService.create(request, actor.id())));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<InvitationDto>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(invitationService.list(pageable))));
    }

    @PostMapping("/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> revoke(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        invitationService.revoke(id, actor.id());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /** PUBLIC — added to SecurityConfig permitAll separately. */
    @GetMapping("/preview/{token}")
    public ResponseEntity<ApiResponse<InvitationPreviewDto>> preview(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.ok(invitationService.preview(token)));
    }

    /** PUBLIC — added to SecurityConfig permitAll separately. */
    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<Void>> accept(@Valid @RequestBody AcceptInvitationRequest request) {
        invitationService.accept(request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
