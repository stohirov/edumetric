package com.edumetric.backend.appeals.dto;

import java.math.BigDecimal;

/**
 * Request to resolve a grade appeal. {@code newValue} is optional — when present,
 * the corrected grade is upserted for the student before the appeal is marked RESOLVED.
 */
public record ResolveAppealRequest(
        String resolution,
        BigDecimal newValue) {
}
