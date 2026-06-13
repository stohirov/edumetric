package com.edumetric.backend.catalog;

import com.edumetric.backend.catalog.dto.CatalogItemDto;
import com.edumetric.backend.catalog.dto.CreateEnrollmentRequestRequest;
import com.edumetric.backend.catalog.dto.EnrollmentRequestDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
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
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CatalogItemDto>>> catalog(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(catalogService.catalog(pageable))));
    }

    @PostMapping("/requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<EnrollmentRequestDto>> request(
            @Valid @RequestBody CreateEnrollmentRequestRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                catalogService.request(principal.id(), request.groupId(), request.message())));
    }

    @GetMapping("/requests/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<EnrollmentRequestDto>>> myRequests(
            @AuthenticationPrincipal AuthenticatedUser principal, Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(catalogService.myRequests(principal.id(), pageable))));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<EnrollmentRequestDto>>> pending(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(catalogService.pending(pageable))));
    }

    @PostMapping("/requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentRequestDto>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.approve(id, principal.id())));
    }

    @PostMapping("/requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentRequestDto>> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.reject(id, principal.id())));
    }
}
