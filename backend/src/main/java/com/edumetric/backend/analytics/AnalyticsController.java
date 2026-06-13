package com.edumetric.backend.analytics;

import com.edumetric.backend.analytics.dto.AdminDashboardDto;
import com.edumetric.backend.analytics.dto.AtRiskStudentDto;
import com.edumetric.backend.analytics.dto.CohortComparisonDto;
import com.edumetric.backend.analytics.dto.GroupAnalyticsDto;
import com.edumetric.backend.analytics.dto.TeacherDashboardDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> adminDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.adminDashboard()));
    }

    @GetMapping("/teacher/dashboard")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<TeacherDashboardDto>> teacherDashboard(
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.teacherDashboard(actor)));
    }

    @GetMapping("/groups/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<GroupAnalyticsDto>> groupAnalytics(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.groupAnalytics(id, actor)));
    }

    @GetMapping("/cohorts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CohortComparisonDto>> cohorts() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.cohortComparison()));
    }

    @GetMapping("/at-risk")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<AtRiskStudentDto>>> atRisk(
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.atRisk(actor)));
    }
}
