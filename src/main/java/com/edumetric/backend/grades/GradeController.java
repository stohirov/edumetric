package com.edumetric.backend.grades;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.grades.dto.BulkGradeRequest;
import com.edumetric.backend.grades.dto.CreateGradeRequest;
import com.edumetric.backend.grades.dto.GradeDto;
import com.edumetric.backend.grades.dto.UpdateGradeRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<GradeDto>> create(
            @Valid @RequestBody CreateGradeRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeService.create(request, principal)));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Integer>> bulk(
            @Valid @RequestBody BulkGradeRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeService.bulk(request, principal).size()));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<GradeDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGradeRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradeService.update(id, request, principal)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        gradeService.delete(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
