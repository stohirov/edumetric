package com.edumetric.backend.analytics.dto;

import java.util.List;

public record GroupAnalyticsDto(
        Long groupId,
        String groupName,
        long studentCount,
        Double averageScore,
        Double averageGrades,
        Double averageAttendance,
        Double averagePractical,
        Double averageBehavior,
        Double averageActivity,
        List<StudentScore> students) {

    public record StudentScore(Long studentId, String fullName, Double compositeScore) {}
}
