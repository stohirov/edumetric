package com.edumetric.backend.atrisk;

import com.edumetric.backend.atrisk.domain.AtRiskRules;
import com.edumetric.backend.atrisk.dto.AtRiskRulesDto;
import com.edumetric.backend.atrisk.dto.UpdateAtRiskRulesRequest;
import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import com.edumetric.backend.security.AuthenticatedUser;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Owns the configurable, multi-factor at-risk rules and the single source of truth for
 * evaluating whether a student's metrics trip them. Both {@code AnalyticsService} and the
 * dashboards route their at-risk decisions through {@link #isAtRisk} / {@link #primaryReason}.
 */
@Service
@RequiredArgsConstructor
public class AtRiskRulesService {

    private final AtRiskRulesRepository rulesRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public AtRiskRulesDto getRules() {
        return AtRiskRulesDto.from(findOrInit());
    }

    /** The singleton rules row, creating defaults on first access. */
    @Transactional
    public AtRiskRules current() {
        return findOrInit();
    }

    @Transactional
    public AtRiskRulesDto updateRules(UpdateAtRiskRulesRequest request, AuthenticatedUser actor) {
        AtRiskRules rules = findOrInit();
        if (request.compositeThreshold() != null) {
            rules.setCompositeThreshold(request.compositeThreshold());
        }
        if (request.attendanceThreshold() != null) {
            rules.setAttendanceThreshold(request.attendanceThreshold());
        }
        if (request.flagLowConfidence() != null) {
            rules.setFlagLowConfidence(request.flagLowConfidence());
        }
        if (request.compositeEnabled() != null) {
            rules.setCompositeEnabled(request.compositeEnabled());
        }
        if (request.attendanceEnabled() != null) {
            rules.setAttendanceEnabled(request.attendanceEnabled());
        }
        rules.setUpdatedAt(Instant.now());
        AtRiskRules saved = rulesRepository.save(rules);
        auditLogService.log("AtRiskRules", saved.getId(), "AT_RISK_RULES_UPDATE",
                actor == null ? null : actor.id(),
                Map.of("compositeThreshold", saved.getCompositeThreshold(),
                        "attendanceThreshold", saved.getAttendanceThreshold()));
        return AtRiskRulesDto.from(saved);
    }

    /** True when any enabled factor flags the student. */
    public boolean isAtRisk(AtRiskRules rules, StudentMetrics m) {
        return reasonOrNull(rules, m) != null;
    }

    /** A human-readable reason the student is at-risk, or a default if no factor explicitly tripped. */
    public String primaryReason(AtRiskRules rules, StudentMetrics m) {
        String reason = reasonOrNull(rules, m);
        return reason != null ? reason : "Below at-risk threshold";
    }

    private String reasonOrNull(AtRiskRules rules, StudentMetrics m) {
        BigDecimal composite = m.getCompositeScore();
        if (rules.isCompositeEnabled() && composite != null
                && composite.doubleValue() < rules.getCompositeThreshold()) {
            return String.format("Composite score below %.0f", rules.getCompositeThreshold());
        }
        BigDecimal attendance = m.getAttendanceNorm();
        if (rules.isAttendanceEnabled() && attendance != null
                && attendance.doubleValue() < rules.getAttendanceThreshold()) {
            return String.format("Attendance below %.0f%%", rules.getAttendanceThreshold());
        }
        if (rules.isFlagLowConfidence() && m.isLowConfidence()) {
            return "Score based on too few data points";
        }
        return null;
    }

    private AtRiskRules findOrInit() {
        return rulesRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> rulesRepository.save(AtRiskRules.builder().build()));
    }
}
