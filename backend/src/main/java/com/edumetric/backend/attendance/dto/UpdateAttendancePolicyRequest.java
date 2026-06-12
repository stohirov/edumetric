package com.edumetric.backend.attendance.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record UpdateAttendancePolicyRequest(
        @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal minAttendancePercent,
        Integer consecutiveAbsenceLimit,
        Boolean notifyOnAbsence) {
}
