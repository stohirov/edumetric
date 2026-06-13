package com.edumetric.backend.reports;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/student/{id}/progress")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProgressReportDto>> studentProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.ok(reportsService.progressReport(user, id)));
    }

    @GetMapping("/me/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ProgressReportDto>> myProgress(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.ok(reportsService.myProgressReport(user)));
    }

    @GetMapping("/metrics.csv")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<String> metricsCsv(@AuthenticationPrincipal AuthenticatedUser user) {
        String csv = reportsService.metricsRosterCsv(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"metrics.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/student/{id}/grades.csv")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> studentGradesCsv(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        String csv = reportsService.studentGradesCsv(user, id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"student-" + id + "-grades.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
