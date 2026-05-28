package com.edumetric.backend.students;

import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.dto.GradeDto;
import com.edumetric.backend.metrics.MetricSnapshotRepository;
import com.edumetric.backend.metrics.StudentMetricsRepository;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import com.edumetric.backend.metrics.dto.StudentMetricsDto;
import com.edumetric.backend.metrics.dto.TrendPointDto;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.students.dto.StudentDashboardDto;
import com.edumetric.backend.students.dto.StudentDashboardDto.BreakdownDto;
import com.edumetric.backend.students.dto.StudentDashboardDto.GrowthAreaDto;
import com.edumetric.backend.students.dto.StudentDashboardDto.PercentileDto;
import com.edumetric.backend.students.dto.StudentDto;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentDashboardService {

    private final StudentRepository studentRepository;
    private final StudentMetricsRepository studentMetricsRepository;
    private final MetricSnapshotRepository metricSnapshotRepository;
    private final GradeRepository gradeRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public StudentDashboardDto dashboard(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student", studentId));
        StudentMetrics metrics = studentMetricsRepository.findByStudentId(studentId).orElse(null);

        StudentMetricsDto metricsDto = metrics == null ? null : StudentMetricsDto.from(metrics);

        List<TrendPointDto> trend = metricSnapshotRepository
                .findAllByStudentIdOrderBySnapshotDateAsc(studentId).stream()
                .map(TrendPointDto::from)
                .toList();

        List<GradeDto> recentGrades = gradeRepository
                .findTop10ByStudentIdOrderByGradedAtDesc(studentId).stream()
                .map(GradeDto::from)
                .toList();

        List<AttendanceDto> recentAttendance = attendanceRepository
                .findTop10ByStudentIdOrderByMarkedAtDesc(studentId).stream()
                .map(AttendanceDto::from)
                .toList();

        BreakdownDto breakdown = metrics == null ? null : new BreakdownDto(
                toDouble(metrics.getGradesNorm()),
                toDouble(metrics.getAttendanceNorm()),
                toDouble(metrics.getPracticalNorm()),
                toDouble(metrics.getBehaviorNorm()),
                toDouble(metrics.getActivityNorm()),
                toDouble(metrics.getGrowthBonus()),
                toDouble(metrics.getConsistencyBonus()));

        PercentileDto percentile = computePercentile(student, metrics);
        List<GrowthAreaDto> growthAreas = computeGrowthAreas(student, metrics);

        return new StudentDashboardDto(
                StudentDto.from(student),
                metricsDto,
                trend,
                breakdown,
                recentGrades,
                recentAttendance,
                growthAreas,
                percentile);
    }

    private PercentileDto computePercentile(Student student, StudentMetrics metrics) {
        if (student.getGroup() == null || metrics == null || metrics.getCompositeScore() == null) {
            return null;
        }
        Long groupId = student.getGroup().getId();
        long total = studentMetricsRepository.countInGroup(groupId);
        if (total == 0) return null;
        long below = studentMetricsRepository.countInGroupBelow(groupId, metrics.getCompositeScore());
        int percentile = (int) Math.round((double) below / total * 100.0);
        return new PercentileDto(groupId, percentile, total);
    }

    private List<GrowthAreaDto> computeGrowthAreas(Student student, StudentMetrics metrics) {
        if (student.getGroup() == null || metrics == null) return List.of();
        List<StudentMetrics> peers = studentMetricsRepository.findAllByGroupId(student.getGroup().getId());
        if (peers.isEmpty()) return List.of();

        double[] gradeAvg = avg(peers, sm -> toDouble(sm.getGradesNorm()));
        double[] attAvg = avg(peers, sm -> toDouble(sm.getAttendanceNorm()));
        double[] pracAvg = avg(peers, sm -> toDouble(sm.getPracticalNorm()));
        double[] behAvg = avg(peers, sm -> toDouble(sm.getBehaviorNorm()));
        double[] actAvg = avg(peers, sm -> toDouble(sm.getActivityNorm()));

        List<GrowthAreaDto> all = new ArrayList<>();
        all.add(new GrowthAreaDto("grades", toDouble(metrics.getGradesNorm()), gradeAvg[0]));
        all.add(new GrowthAreaDto("attendance", toDouble(metrics.getAttendanceNorm()), attAvg[0]));
        all.add(new GrowthAreaDto("practical", toDouble(metrics.getPracticalNorm()), pracAvg[0]));
        all.add(new GrowthAreaDto("behavior", toDouble(metrics.getBehaviorNorm()), behAvg[0]));
        all.add(new GrowthAreaDto("activity", toDouble(metrics.getActivityNorm()), actAvg[0]));

        all.sort(Comparator.comparingDouble(g -> {
            Double s = g.score();
            Double a = g.groupAverage();
            return (s == null ? 0 : s) - (a == null ? 0 : a);
        }));
        return all.subList(0, Math.min(3, all.size()));
    }

    private static double[] avg(List<StudentMetrics> peers, java.util.function.Function<StudentMetrics, Double> getter) {
        double sum = 0;
        int n = 0;
        for (StudentMetrics m : peers) {
            Double v = getter.apply(m);
            if (v == null) continue;
            sum += v;
            n++;
        }
        return new double[]{n == 0 ? 0 : sum / n};
    }

    private static Double toDouble(BigDecimal b) {
        return b == null ? null : b.doubleValue();
    }
}
