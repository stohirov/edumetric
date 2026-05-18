package com.edumetric.backend.analytics.dto;

import java.util.List;

public record AdminDashboardDto(
        Kpis kpis,
        List<HistogramBucket> scoreDistribution,
        List<GroupSummary> topGroups,
        List<TeacherActivity> teacherActivity) {

    public record Kpis(
            long studentCount,
            long groupCount,
            long teacherCount,
            Double averageScore,
            long atRiskCount) {}

    public record HistogramBucket(int low, int high, long count) {}

    public record GroupSummary(Long groupId, String groupName, long studentCount, Double averageScore) {}

    public record TeacherActivity(Long teacherId, String fullName, long pointsLast7Days) {}
}
