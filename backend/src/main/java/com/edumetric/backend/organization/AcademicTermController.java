package com.edumetric.backend.organization;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.organization.dto.AcademicTermDto;
import com.edumetric.backend.organization.dto.CreateAcademicTermRequest;
import com.edumetric.backend.organization.dto.UpdateAcademicTermRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/academic-terms")
@RequiredArgsConstructor
public class AcademicTermController {

    private final AcademicTermService academicTermService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AcademicTermDto>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(academicTermService.list()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AcademicTermDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(academicTermService.get(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicTermDto>> create(
            @Valid @RequestBody CreateAcademicTermRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(academicTermService.create(request, actor.id())));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicTermDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAcademicTermRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(academicTermService.update(id, request, actor.id())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        academicTermService.delete(id, actor.id());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
