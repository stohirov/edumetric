package com.edumetric.backend.parents;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.parents.dto.ChildSummaryDto;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.dto.StudentDashboardDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Self-service read-only access for the logged-in parent/guardian. */
@RestController
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/me/children")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<ApiResponse<List<ChildSummaryDto>>> myChildren(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(parentService.listChildren(principal.id())));
    }

    @GetMapping("/me/children/{studentId}/dashboard")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> childDashboard(
            @PathVariable Long studentId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(parentService.childDashboard(principal.id(), studentId)));
    }
}
