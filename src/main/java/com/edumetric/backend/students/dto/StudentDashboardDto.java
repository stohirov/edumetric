package com.edumetric.backend.students.dto;

import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.grades.dto.GradeDto;
import com.edumetric.backend.metrics.dto.StudentMetricsDto;
import com.edumetric.backend.metrics.dto.TrendPointDto;
import java.util.List;

public record StudentDashboardDto(
        StudentDto student,
        StudentMetricsDto metrics,
        List<TrendPointDto> trend,
        BreakdownDto breakdown,
        List<GradeDto> recentGrades,
        List<AttendanceDto> recentAttendance,
        List<GrowthAreaDto> growthAreas,
        PercentileDto groupPercentile) {

    public record BreakdownDto(
            Double grades,
            Double attendance,
            Double practical,
            Double behavior,
            Double activity,
            Double growth,
            Double consistency) {}

    public record GrowthAreaDto(String dimension, Double score, Double groupAverage) {}

    public record PercentileDto(Long groupId, int percentile, long groupSize) {}
}
