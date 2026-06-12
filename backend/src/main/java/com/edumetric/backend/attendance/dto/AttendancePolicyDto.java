package com.edumetric.backend.attendance.dto;

import com.edumetric.backend.attendance.domain.AttendancePolicy;
import java.math.BigDecimal;

public record AttendancePolicyDto(
        BigDecimal minAttendancePercent,
        int consecutiveAbsenceLimit,
        boolean notifyOnAbsence) {

    public static AttendancePolicyDto from(AttendancePolicy p) {
        return new AttendancePolicyDto(
                p.getMinAttendancePercent(), p.getConsecutiveAbsenceLimit(), p.isNotifyOnAbsence());
    }
}
