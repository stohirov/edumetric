package com.edumetric.backend.justifications;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.justifications.dto.CreateJustificationRequest;
import com.edumetric.backend.justifications.dto.DecisionRequest;
import com.edumetric.backend.justifications.dto.JustificationDto;
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
@RequestMapping("/api/justifications")
@RequiredArgsConstructor
public class AbsenceJustificationController {

    private final AbsenceJustificationService justificationService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<JustificationDto>> submit(
            @Valid @RequestBody CreateJustificationRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(justificationService.submit(request, principal)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<JustificationDto>>> myJustifications(
            @AuthenticationPrincipal AuthenticatedUser principal, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.of(justificationService.myJustifications(principal, pageable))));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<JustificationDto>>> pending(
            @AuthenticationPrincipal AuthenticatedUser principal, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                PageResponse.of(justificationService.pending(principal, pageable))));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<JustificationDto>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(justificationService.approve(id, principal)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<JustificationDto>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) DecisionRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(justificationService.reject(id, request, principal)));
    }
}
