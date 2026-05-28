package com.edumetric.backend.analytics.dto;

import java.math.BigDecimal;

public record AtRiskStudentDto(
        Long studentId,
        String fullName,
        String email,
        Long groupId,
        String groupName,
        BigDecimal compositeScore,
        BigDecimal attendanceNorm,
        String reason) {
}
