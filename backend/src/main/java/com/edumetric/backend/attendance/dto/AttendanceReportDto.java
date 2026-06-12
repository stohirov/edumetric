package com.edumetric.backend.attendance.dto;

/** A single student's attendance summary with computed percentage and at-risk flag. */
public record AttendanceReportDto(
        Long studentId,
        String studentName,
        int present,
        int late,
        int absent,
        int excused,
        int total,
        Double attendancePercent,
        boolean atRisk,
        double minPercent) {
}
