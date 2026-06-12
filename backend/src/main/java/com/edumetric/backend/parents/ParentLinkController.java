package com.edumetric.backend.parents;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.parents.dto.CreateParentLinkRequest;
import com.edumetric.backend.parents.dto.ParentLinkDto;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Admin management of parent/guardian-to-student links. */
@RestController
@RequestMapping("/api/parent-links")
@RequiredArgsConstructor
public class ParentLinkController {

    private final ParentService parentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParentLinkDto>> create(
            @Valid @RequestBody CreateParentLinkRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(parentService.createLink(request, principal.id())));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ParentLinkDto>>> list(
            @RequestParam(required = false) Long parentUserId,
            @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(parentService.listLinks(parentUserId, studentId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        parentService.deleteLink(id, principal.id());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
