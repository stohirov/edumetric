package com.edumetric.backend.appeals;

import com.edumetric.backend.appeals.dto.CreateAppealRequest;
import com.edumetric.backend.appeals.dto.GradeAppealDto;
import com.edumetric.backend.appeals.dto.RejectAppealRequest;
import com.edumetric.backend.appeals.dto.ResolveAppealRequest;
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
@RequestMapping("/api/appeals")
@RequiredArgsConstructor
public class GradeAppealController {

    private final GradeAppealService gradeAppealService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<GradeAppealDto>> open(
            @Valid @RequestBody CreateAppealRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeAppealService.open(request, principal)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<GradeAppealDto>>> myAppeals(
            @AuthenticationPrincipal AuthenticatedUser principal, Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(gradeAppealService.myAppeals(principal, pageable))));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<GradeAppealDto>>> pending(
            @AuthenticationPrincipal AuthenticatedUser principal, Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(gradeAppealService.pending(principal, pageable))));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<GradeAppealDto>> resolve(
            @PathVariable Long id,
            @Valid @RequestBody ResolveAppealRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeAppealService.resolve(id, request, principal)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<GradeAppealDto>> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectAppealRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeAppealService.reject(id, request, principal)));
    }
}
