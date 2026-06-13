package com.edumetric.backend.atrisk;

import com.edumetric.backend.atrisk.dto.AtRiskRulesDto;
import com.edumetric.backend.atrisk.dto.UpdateAtRiskRulesRequest;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/at-risk-rules")
@RequiredArgsConstructor
public class AtRiskRulesController {

    private final AtRiskRulesService atRiskRulesService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ApiResponse<AtRiskRulesDto>> getRules() {
        return ResponseEntity.ok(ApiResponse.ok(atRiskRulesService.getRules()));
    }

    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AtRiskRulesDto>> updateRules(
            @Valid @RequestBody UpdateAtRiskRulesRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(atRiskRulesService.updateRules(request, actor)));
    }
}
