package com.edumetric.backend.analytics.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardDto(
        Kpis kpis,
        List<HistogramBucket> scoreDistribution,
        List<GroupSummary> topGroups,
        List<TeacherActivity> teacherActivity,
        List<TrendPoint> growthTrend,
        List<WeeklyActivityPoint> weeklyActivity,
        List<AttendanceWeekPoint> attendanceAnalytics,
        List<Insight> insights) {

    public record Kpis(
            long studentCount,
            long groupCount,
            long teacherCount,
            Double averageScore,
            long atRiskCount) {}

    public record HistogramBucket(int low, int high, long count) {}

    public record GroupSummary(Long groupId, String groupName, long studentCount, Double averageScore) {}

    public record TeacherActivity(Long teacherId, String fullName, long pointsLast7Days) {}

    public record TrendPoint(
            String monthKey,
            BigDecimal compositeAvg,
            BigDecimal attendanceAvg,
            BigDecimal assignmentsAvg) {}

    public record WeeklyActivityPoint(
            String weekdayKey,
            long sessions,
            long submissions,
            int engagementPercent) {}

    public record AttendanceWeekPoint(
            String week,
            BigDecimal rate,
            long present,
            long absent,
            long late,
            long excused) {}

    public record Insight(
            String id,
            String title,
            String detail,
            String time,
            String type) {}
}
