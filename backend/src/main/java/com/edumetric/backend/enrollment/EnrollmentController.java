package com.edumetric.backend.enrollment;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.enrollment.dto.EnrollRequest;
import com.edumetric.backend.enrollment.dto.EnrollmentDto;
import com.edumetric.backend.enrollment.dto.TransferRequest;
import com.edumetric.backend.enrollment.dto.WithdrawRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/enroll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> enroll(
            @Valid @RequestBody EnrollRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.enroll(request, actor.id())));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> transfer(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.transfer(request, actor.id())));
    }

    @PostMapping("/withdraw")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentDto>> withdraw(
            @Valid @RequestBody WithdrawRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.withdraw(request, actor.id())));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<EnrollmentDto>>> history(
            @PathVariable Long studentId,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.history(studentId, actor)));
    }
}
