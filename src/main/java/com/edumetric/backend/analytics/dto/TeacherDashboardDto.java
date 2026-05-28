package com.edumetric.backend.analytics.dto;

import com.edumetric.backend.analytics.dto.AdminDashboardDto.HistogramBucket;
import java.util.List;

public record TeacherDashboardDto(
        Kpis kpis,
        List<HistogramBucket> scoreDistribution,
        List<GroupSummary> groups) {

    public record Kpis(
            long studentCount,
            long groupCount,
            Double averageScore,
            long atRiskCount) {}

    public record GroupSummary(Long groupId, String groupName, long studentCount, Double averageScore) {}
}
