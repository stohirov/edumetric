package com.edumetric.backend.analytics;

import com.edumetric.backend.analytics.dto.AdminDashboardDto;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.GroupSummary;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.HistogramBucket;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.Kpis;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.TeacherActivity;
import com.edumetric.backend.analytics.dto.AtRiskStudentDto;
import com.edumetric.backend.analytics.dto.GroupAnalyticsDto;
import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.metrics.StudentMetricsRepository;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final GroupRepository groupRepository;
    private final StudentMetricsRepository studentMetricsRepository;
    private final LessonRepository lessonRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDto adminDashboard() {
        long students = studentRepository.count();
        long groups = groupRepository.count();
        long teachers = teacherRepository.count();
        Double avg = studentMetricsRepository.averageCompositeScore();
        long atRisk = studentMetricsRepository.countAtRisk();

        Kpis kpis = new Kpis(students, groups, teachers, avg, atRisk);

        List<StudentMetrics> all = studentMetricsRepository.findAll();
        List<HistogramBucket> histogram = histogram(all);

        List<GroupSummary> topGroups = groupRepository.findAll().stream()
                .map(this::summarize)
                .filter(g -> g.studentCount() > 0)
                .sorted(Comparator.comparing(
                        GroupSummary::averageScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList();

        List<TeacherActivity> activity = teacherActivity();

        return new AdminDashboardDto(kpis, histogram, topGroups, activity);
    }

    @Transactional(readOnly = true)
    public GroupAnalyticsDto groupAnalytics(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> ResourceNotFoundException.of("Group", groupId));
        List<StudentMetrics> metrics = studentMetricsRepository.findAllByStudentGroupId(groupId);

        double[] sums = new double[5];
        int[] counts = new int[5];
        Double avgScore = null;
        double scoreSum = 0;
        int scoreN = 0;
        List<GroupAnalyticsDto.StudentScore> rows = new ArrayList<>();
        for (StudentMetrics m : metrics) {
            accumulate(sums, counts, 0, m.getGradesNorm());
            accumulate(sums, counts, 1, m.getAttendanceNorm());
            accumulate(sums, counts, 2, m.getPracticalNorm());
            accumulate(sums, counts, 3, m.getBehaviorNorm());
            accumulate(sums, counts, 4, m.getActivityNorm());
            Double cs = m.getCompositeScore() == null ? null : m.getCompositeScore().doubleValue();
            if (cs != null) {
                scoreSum += cs;
                scoreN++;
            }
            rows.add(new GroupAnalyticsDto.StudentScore(
                    m.getStudent().getId(), m.getStudent().getUser().getFullName(), cs));
        }
        if (scoreN > 0) avgScore = scoreSum / scoreN;

        return new GroupAnalyticsDto(
                group.getId(), group.getName(),
                studentRepository.countByGroupId(groupId),
                avgScore,
                avgOrNull(sums, counts, 0),
                avgOrNull(sums, counts, 1),
                avgOrNull(sums, counts, 2),
                avgOrNull(sums, counts, 3),
                avgOrNull(sums, counts, 4),
                rows);
    }

    @Transactional(readOnly = true)
    public List<AtRiskStudentDto> atRisk(AuthenticatedUser actor) {
        List<StudentMetrics> base = switch (actor.role()) {
            case ADMIN -> studentMetricsRepository.findAllAtRisk();
            case TEACHER -> {
                List<Long> groupIds = lessonRepository.findGroupIdsForTeacherUser(actor.id());
                yield groupIds.isEmpty() ? List.of()
                        : studentMetricsRepository.findAtRiskInGroups(groupIds);
            }
            case STUDENT -> throw new ForbiddenException("Students cannot view at-risk list");
        };
        return base.stream().map(this::toAtRiskDto).toList();
    }

    private AtRiskStudentDto toAtRiskDto(StudentMetrics m) {
        String reason = primaryReason(m);
        return new AtRiskStudentDto(
                m.getStudent().getId(),
                m.getStudent().getUser().getFullName(),
                m.getStudent().getGroup() == null ? null : m.getStudent().getGroup().getId(),
                m.getStudent().getGroup() == null ? null : m.getStudent().getGroup().getName(),
                m.getCompositeScore(),
                m.getAttendanceNorm(),
                reason);
    }

    private String primaryReason(StudentMetrics m) {
        BigDecimal att = m.getAttendanceNorm();
        if (att != null && att.doubleValue() < 70) return "Attendance below 70%";
        if (m.getCompositeScore() != null && m.getCompositeScore().doubleValue() < 40)
            return "Composite score below 40";
        return "Composite score below threshold";
    }

    private GroupSummary summarize(Group group) {
        List<StudentMetrics> metrics = studentMetricsRepository.findAllByStudentGroupId(group.getId());
        double sum = 0;
        int n = 0;
        for (StudentMetrics m : metrics) {
            if (m.getCompositeScore() == null) continue;
            sum += m.getCompositeScore().doubleValue();
            n++;
        }
        Double avg = n == 0 ? null : sum / n;
        return new GroupSummary(
                group.getId(), group.getName(),
                studentRepository.countByGroupId(group.getId()),
                avg);
    }

    private List<HistogramBucket> histogram(List<StudentMetrics> all) {
        int[] buckets = new int[10];
        for (StudentMetrics m : all) {
            if (m.getCompositeScore() == null) continue;
            int idx = Math.min(9, m.getCompositeScore().intValue() / 10);
            buckets[idx]++;
        }
        List<HistogramBucket> out = new ArrayList<>(10);
        for (int i = 0; i < 10; i++) {
            out.add(new HistogramBucket(i * 10, (i + 1) * 10, buckets[i]));
        }
        return out;
    }

    private List<TeacherActivity> teacherActivity() {
        return teacherRepository.findAll().stream()
                .map(t -> new TeacherActivity(
                        t.getId(),
                        t.getUser().getFullName(),
                        0L))
                .toList();
    }

    private static void accumulate(double[] sums, int[] counts, int idx, BigDecimal v) {
        if (v == null) return;
        sums[idx] += v.doubleValue();
        counts[idx]++;
    }

    private static Double avgOrNull(double[] sums, int[] counts, int idx) {
        return counts[idx] == 0 ? null : sums[idx] / counts[idx];
    }
}
