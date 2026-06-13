package com.edumetric.backend.metrics;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.metrics.domain.FormulaConfig;
import com.edumetric.backend.metrics.dto.FormulaConfigDto;
import com.edumetric.backend.metrics.dto.FormulaPreviewDto;
import com.edumetric.backend.metrics.dto.StudentMetricsDto;
import com.edumetric.backend.metrics.dto.TrendPointDto;
import com.edumetric.backend.metrics.dto.UpdateFormulaRequest;
import com.edumetric.backend.metrics.engine.ScoreFormula;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.users.domain.Role;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;
    private final StudentMetricsRepository studentMetricsRepository;
    private final MetricSnapshotRepository metricSnapshotRepository;
    private final AuditLogService auditLogService;
    private final TeacherScope teacherScope;

    @GetMapping("/students/{id}/metrics")
    @PreAuthorize("hasRole('TEACHER') or @studentSelfScope.isSelf(authentication.principal, #id)")
    public ResponseEntity<ApiResponse<StudentMetricsDto>> studentMetrics(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user.role() == Role.TEACHER) {
            teacherScope.assertCanWriteFor(user, id);
        }
        StudentMetricsDto dto = studentMetricsRepository.findByStudentId(id)
                .map(StudentMetricsDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("StudentMetrics", id));
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/students/{id}/metrics/trend")
    @PreAuthorize("hasRole('TEACHER') or @studentSelfScope.isSelf(authentication.principal, #id)")
    public ResponseEntity<ApiResponse<List<TrendPointDto>>> trend(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        if (user.role() == Role.TEACHER) {
            teacherScope.assertCanWriteFor(user, id);
        }
        List<TrendPointDto> trend = metricSnapshotRepository
                .findAllByStudentIdOrderBySnapshotDateAsc(id)
                .stream()
                .map(TrendPointDto::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(trend));
    }

    @PostMapping("/metrics/recompute/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentMetricsDto>> recompute(
            @PathVariable Long studentId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        metricsService.recompute(studentId);
        StudentMetricsDto dto = studentMetricsRepository.findByStudentId(studentId)
                .map(StudentMetricsDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("StudentMetrics", studentId));
        auditLogService.log("Student", studentId, "METRICS_RECOMPUTE", user.id(), null);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/metrics/recompute-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recomputeAll(
            @AuthenticationPrincipal AuthenticatedUser user) {
        int processed = metricsService.recomputeAll();
        auditLogService.log("Metrics", null, "METRICS_RECOMPUTE_ALL", user.id(),
                Map.of("processed", processed));
        return ResponseEntity.ok(ApiResponse.ok(Map.of("processed", processed)));
    }

    @GetMapping("/metrics/formula")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FormulaConfigDto>> formula() {
        return ResponseEntity.ok(ApiResponse.ok(FormulaConfigDto.from(metricsService.activeFormula())));
    }

    @PostMapping("/metrics/formula/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FormulaPreviewDto>> previewFormula(
            @Valid @RequestBody UpdateFormulaRequest request) {
        ScoreFormula formula = new ScoreFormula(
                request.version(),
                request.weightGrades().doubleValue(),
                request.weightAttendance().doubleValue(),
                request.weightPractical().doubleValue(),
                request.weightBehavior().doubleValue(),
                request.weightActivity().doubleValue(),
                request.weightGrowth().doubleValue(),
                request.weightConsistency().doubleValue());
        return ResponseEntity.ok(ApiResponse.ok(metricsService.previewFormula(formula)));
    }

    @PutMapping("/metrics/formula")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FormulaConfigDto>> updateFormula(
            @Valid @RequestBody UpdateFormulaRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        ScoreFormula formula = new ScoreFormula(
                request.version(),
                request.weightGrades().doubleValue(),
                request.weightAttendance().doubleValue(),
                request.weightPractical().doubleValue(),
                request.weightBehavior().doubleValue(),
                request.weightActivity().doubleValue(),
                request.weightGrowth().doubleValue(),
                request.weightConsistency().doubleValue());
        FormulaConfig saved = metricsService.updateFormula(formula);
        int recomputed = metricsService.recomputeAll();
        auditLogService.log("FormulaConfig", saved.getId(), "FORMULA_UPDATE", user.id(),
                Map.of("version", saved.getVersion(), "recomputed", recomputed));
        return ResponseEntity.ok(ApiResponse.ok(FormulaConfigDto.from(saved)));
    }
}
