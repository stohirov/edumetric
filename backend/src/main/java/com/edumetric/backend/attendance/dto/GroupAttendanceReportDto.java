package com.edumetric.backend.attendance.dto;

import java.util.List;

/** Aggregated attendance report for a whole group plus per-student breakdowns. */
public record GroupAttendanceReportDto(
        Long groupId,
        String groupName,
        Double groupAveragePercent,
        List<AttendanceReportDto> students) {
}
