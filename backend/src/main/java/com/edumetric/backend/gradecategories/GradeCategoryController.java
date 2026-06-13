package com.edumetric.backend.gradecategories;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.gradecategories.dto.CreateGradeCategoryRequest;
import com.edumetric.backend.gradecategories.dto.GradeCategoryDto;
import com.edumetric.backend.gradecategories.dto.UpdateGradeCategoryRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grade-categories")
@RequiredArgsConstructor
public class GradeCategoryController {

    private final GradeCategoryService gradeCategoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<GradeCategoryDto>>> listByCourse(
            @RequestParam Long courseId,
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(gradeCategoryService.listByCourse(courseId, principal, pageable))));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<GradeCategoryDto>> create(
            @Valid @RequestBody CreateGradeCategoryRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeCategoryService.create(request, principal)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<GradeCategoryDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGradeCategoryRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeCategoryService.update(id, request, principal)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        gradeCategoryService.delete(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
