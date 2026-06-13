package com.edumetric.backend.analytics;

import com.edumetric.backend.analytics.dto.AdminDashboardDto;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.GroupSummary;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.HistogramBucket;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.Insight;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.Kpis;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.TeacherActivity;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.TrendPoint;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.AttendanceWeekPoint;
import com.edumetric.backend.analytics.dto.AdminDashboardDto.WeeklyActivityPoint;
import com.edumetric.backend.analytics.dto.AtRiskStudentDto;
import com.edumetric.backend.analytics.dto.CohortComparisonDto;
import com.edumetric.backend.analytics.dto.GroupAnalyticsDto;
import com.edumetric.backend.analytics.dto.TeacherDashboardDto;
import com.edumetric.backend.atrisk.AtRiskRulesService;
import com.edumetric.backend.atrisk.domain.AtRiskRules;
import com.edumetric.backend.attendance.AttendanceRepository;
import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import com.edumetric.backend.common.exception.ForbiddenException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.config.CacheConfig;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.metrics.MetricSnapshotRepository;
import com.edumetric.backend.metrics.StudentMetricsRepository;
import com.edumetric.backend.metrics.domain.MetricSnapshot;
import com.edumetric.backend.metrics.domain.StudentMetrics;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Locale;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
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
    private final GradeRepository gradeRepository;
    private final MetricSnapshotRepository metricSnapshotRepository;
    private final AtRiskRulesService atRiskRulesService;

    @Cacheable(cacheNames = CacheConfig.ADMIN_DASHBOARD, key = "'all'")
    @Transactional(readOnly = true)
    public AdminDashboardDto adminDashboard() {
        long students = studentRepository.count();
        long groups = groupRepository.count();
        long teachers = teacherRepository.count();
        Double avg = studentMetricsRepository.averageCompositeScore();

        List<StudentMetrics> all = studentMetricsRepository.findAllWithStudent();
        AtRiskRules rules = atRiskRulesService.current();
        long atRisk = all.stream().filter(m -> atRiskRulesService.isAtRisk(rules, m)).count();

        Kpis kpis = new Kpis(students, groups, teachers, avg, atRisk);

        List<HistogramBucket> histogram = histogram(all);

        // Group the metrics we already loaded in memory and batch the student counts,
        // instead of issuing two queries per group inside the stream (N+1).
        List<Group> allGroups = groupRepository.findAll();
        Map<Long, List<StudentMetrics>> metricsByGroup = groupByGroupId(all);
        Map<Long, Long> studentCounts =
                studentCountsByGroup(allGroups.stream().map(Group::getId).toList());
        List<GroupSummary> topGroups = allGroups.stream()
                .map(g -> summarize(
                        g,
                        metricsByGroup.getOrDefault(g.getId(), List.of()),
                        studentCounts.getOrDefault(g.getId(), 0L)))
                .filter(g -> g.studentCount() > 0)
                .sorted(Comparator.comparing(
                        GroupSummary::averageScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList();

        List<TeacherActivity> activity = teacherActivity();

        List<TrendPoint> growthTrend = growthTrend();
        List<WeeklyActivityPoint> weeklyActivity = weeklyActivity();
        List<AttendanceWeekPoint> attendanceAnalytics = attendanceAnalytics();
        List<Insight> insights = institutionInsights(all, avg, atRisk);

        return new AdminDashboardDto(
                kpis, histogram, topGroups, activity, growthTrend, weeklyActivity,
                attendanceAnalytics, insights);
    }

    @Transactional(readOnly = true)
    public GroupAnalyticsDto groupAnalytics(Long groupId, AuthenticatedUser actor) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> ResourceNotFoundException.of("Group", groupId));
        if (actor.role() != Role.ADMIN
                && !lessonRepository.teacherUserTeachesCourse(actor.id(), group.getCourse().getId())) {
            throw new ForbiddenException("Not authorized to view analytics for group " + groupId);
        }
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

    @Cacheable(cacheNames = CacheConfig.TEACHER_DASHBOARD, key = "#actor.id()")
    @Transactional(readOnly = true)
    public TeacherDashboardDto teacherDashboard(AuthenticatedUser actor) {
        List<Long> groupIds = lessonRepository.findGroupIdsForTeacherUser(actor.id());
        if (groupIds.isEmpty()) {
            return new TeacherDashboardDto(
                    new TeacherDashboardDto.Kpis(0, 0, null, 0),
                    histogram(List.of()),
                    List.of());
        }

        List<StudentMetrics> metrics = studentMetricsRepository.findAllByStudentGroupIdIn(groupIds);

        Map<Long, Long> studentCounts = studentCountsByGroup(groupIds);
        long studentCount = studentCounts.values().stream().mapToLong(Long::longValue).sum();

        AtRiskRules rules = atRiskRulesService.current();
        double sum = 0;
        int n = 0;
        long atRisk = 0;
        for (StudentMetrics m : metrics) {
            if (atRiskRulesService.isAtRisk(rules, m)) atRisk++;
            if (m.getCompositeScore() == null) continue;
            sum += m.getCompositeScore().doubleValue();
            n++;
        }
        Double avg = n == 0 ? null : sum / n;

        Map<Long, List<StudentMetrics>> metricsByGroup = groupByGroupId(metrics);
        List<TeacherDashboardDto.GroupSummary> groups = groupRepository.findAllById(groupIds).stream()
                .map(g -> summarizeForTeacher(
                        g,
                        metricsByGroup.getOrDefault(g.getId(), List.of()),
                        studentCounts.getOrDefault(g.getId(), 0L)))
                .sorted(Comparator.comparing(
                        TeacherDashboardDto.GroupSummary::averageScore,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        return new TeacherDashboardDto(
                new TeacherDashboardDto.Kpis(studentCount, groupIds.size(), avg, atRisk),
                histogram(metrics),
                groups);
    }

    private TeacherDashboardDto.GroupSummary summarizeForTeacher(
            Group group, List<StudentMetrics> metrics, long studentCount) {
        double sum = 0;
        int n = 0;
        for (StudentMetrics m : metrics) {
            if (m.getCompositeScore() == null) continue;
            sum += m.getCompositeScore().doubleValue();
            n++;
        }
        Double avg = n == 0 ? null : sum / n;
        return new TeacherDashboardDto.GroupSummary(
                group.getId(), group.getName(), studentCount, avg);
    }

    @Cacheable(cacheNames = CacheConfig.COHORT_COMPARISON, key = "'all'")
    @Transactional(readOnly = true)
    public CohortComparisonDto cohortComparison() {
        AtRiskRules rules = atRiskRulesService.current();
        List<CohortComparisonDto.CohortRow> rows = new ArrayList<>();
        // One metrics query + one batched count query, grouped in memory — replaces the
        // two-queries-per-group fan-out the loop used to issue.
        List<Group> allGroups = groupRepository.findAll();
        Map<Long, List<StudentMetrics>> metricsByGroup =
                groupByGroupId(studentMetricsRepository.findAllWithStudent());
        Map<Long, Long> studentCounts =
                studentCountsByGroup(allGroups.stream().map(Group::getId).toList());
        for (Group group : allGroups) {
            List<StudentMetrics> metrics = metricsByGroup.getOrDefault(group.getId(), List.of());
            long groupStudentCount = studentCounts.getOrDefault(group.getId(), 0L);
            if (metrics.isEmpty() && groupStudentCount == 0) {
                continue;
            }
            double[] sums = new double[3]; // composite, attendance, grades
            int[] counts = new int[3];
            long atRisk = 0;
            for (StudentMetrics m : metrics) {
                if (atRiskRulesService.isAtRisk(rules, m)) atRisk++;
                Double cs = m.getCompositeScore() == null ? null : m.getCompositeScore().doubleValue();
                if (cs != null) {
                    sums[0] += cs;
                    counts[0]++;
                }
                accumulate(sums, counts, 1, m.getAttendanceNorm());
                accumulate(sums, counts, 2, m.getGradesNorm());
            }
            rows.add(new CohortComparisonDto.CohortRow(
                    group.getId(), group.getName(),
                    groupStudentCount,
                    avgOrNull(sums, counts, 0),
                    avgOrNull(sums, counts, 1),
                    avgOrNull(sums, counts, 2),
                    atRisk));
        }
        rows.sort(Comparator.comparing(
                CohortComparisonDto.CohortRow::avgComposite,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return new CohortComparisonDto(rows, longitudinal());
    }

    private List<CohortComparisonDto.LongitudinalPoint> longitudinal() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate from = today.minusMonths(5).withDayOfMonth(1);
        List<MetricSnapshot> snapshots =
                metricSnapshotRepository.findAllBySnapshotDateGreaterThanEqualOrderBySnapshotDateAsc(from);
        Map<Month, double[]> sums = new LinkedHashMap<>();
        Map<Month, int[]> counts = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            Month m = today.minusMonths(i).getMonth();
            sums.put(m, new double[1]);
            counts.put(m, new int[1]);
        }
        for (MetricSnapshot s : snapshots) {
            double[] sm = sums.get(s.getSnapshotDate().getMonth());
            int[] cm = counts.get(s.getSnapshotDate().getMonth());
            if (sm == null) continue;
            addBucket(sm, cm, 0, s.getCompositeScore());
        }
        List<CohortComparisonDto.LongitudinalPoint> out = new ArrayList<>(6);
        for (Map.Entry<Month, double[]> e : sums.entrySet()) {
            out.add(new CohortComparisonDto.LongitudinalPoint(
                    e.getKey().name(), bucketAvg(e.getValue(), counts.get(e.getKey()), 0)));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<AtRiskStudentDto> atRisk(AuthenticatedUser actor) {
        List<StudentMetrics> base = switch (actor.role()) {
            case ADMIN -> studentMetricsRepository.findAllWithStudent();
            case TEACHER -> {
                List<Long> groupIds = lessonRepository.findGroupIdsForTeacherUser(actor.id());
                yield groupIds.isEmpty() ? List.of()
                        : studentMetricsRepository.findAllByStudentGroupIdIn(groupIds);
            }
            case STUDENT, PARENT -> throw new ForbiddenException("Not authorized to view at-risk list");
        };
        AtRiskRules rules = atRiskRulesService.current();
        return base.stream()
                .filter(m -> atRiskRulesService.isAtRisk(rules, m))
                .map(m -> toAtRiskDto(rules, m))
                .toList();
    }

    private AtRiskStudentDto toAtRiskDto(AtRiskRules rules, StudentMetrics m) {
        String reason = atRiskRulesService.primaryReason(rules, m);
        return new AtRiskStudentDto(
                m.getStudent().getId(),
                m.getStudent().getUser().getFullName(),
                m.getStudent().getUser().getEmail(),
                m.getStudent().getGroup() == null ? null : m.getStudent().getGroup().getId(),
                m.getStudent().getGroup() == null ? null : m.getStudent().getGroup().getName(),
                m.getCompositeScore(),
                m.getAttendanceNorm(),
                reason);
    }

    private GroupSummary summarize(Group group, List<StudentMetrics> metrics, long studentCount) {
        double sum = 0;
        int n = 0;
        for (StudentMetrics m : metrics) {
            if (m.getCompositeScore() == null) continue;
            sum += m.getCompositeScore().doubleValue();
            n++;
        }
        Double avg = n == 0 ? null : sum / n;
        return new GroupSummary(group.getId(), group.getName(), studentCount, avg);
    }

    /** Groups metrics by their student's group id, skipping students without a group. */
    private Map<Long, List<StudentMetrics>> groupByGroupId(List<StudentMetrics> metrics) {
        Map<Long, List<StudentMetrics>> byGroup = new HashMap<>();
        for (StudentMetrics m : metrics) {
            Group g = m.getStudent().getGroup();
            if (g == null) continue;
            byGroup.computeIfAbsent(g.getId(), k -> new ArrayList<>()).add(m);
        }
        return byGroup;
    }

    /** Student count per group in a single grouped query (empty for an empty input). */
    private Map<Long, Long> studentCountsByGroup(List<Long> groupIds) {
        Map<Long, Long> counts = new HashMap<>();
        if (groupIds.isEmpty()) return counts;
        for (Object[] row : studentRepository.countByGroupIdIn(groupIds)) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        return counts;
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

    private List<TrendPoint> growthTrend() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate from = today.minusMonths(5).withDayOfMonth(1);
        List<MetricSnapshot> snapshots =
                metricSnapshotRepository.findAllBySnapshotDateGreaterThanEqualOrderBySnapshotDateAsc(from);

        Map<Month, double[]> sums = new LinkedHashMap<>();
        Map<Month, int[]> counts = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            Month m = today.minusMonths(i).getMonth();
            sums.put(m, new double[3]);
            counts.put(m, new int[3]);
        }
        for (MetricSnapshot s : snapshots) {
            Month m = s.getSnapshotDate().getMonth();
            double[] sm = sums.get(m);
            int[] cm = counts.get(m);
            if (sm == null) continue;
            addBucket(sm, cm, 0, s.getCompositeScore());
            addBucket(sm, cm, 1, s.getAttendanceNorm());
            addBucket(sm, cm, 2, s.getGradesNorm());
        }
        List<TrendPoint> out = new ArrayList<>(6);
        for (Map.Entry<Month, double[]> e : sums.entrySet()) {
            Month m = e.getKey();
            double[] sm = e.getValue();
            int[] cm = counts.get(m);
            out.add(new TrendPoint(
                    m.name(),
                    bucketAvg(sm, cm, 0),
                    bucketAvg(sm, cm, 1),
                    bucketAvg(sm, cm, 2)));
        }
        return out;
    }

    private List<WeeklyActivityPoint> weeklyActivity() {
        Instant since = Instant.now().minus(7, ChronoUnit.DAYS);
        List<Grade> grades = gradeRepository.findAllByGradedAtAfter(since);
        List<Attendance> attendances = attendanceRepository.findAllByMarkedAtAfter(since);

        Map<DayOfWeek, long[]> agg = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek d : DayOfWeek.values()) {
            agg.put(d, new long[3]); // [sessions, submissions, presentSessions]
        }
        for (Attendance a : attendances) {
            if (a.getMarkedAt() == null) continue;
            DayOfWeek dow = a.getMarkedAt().atOffset(ZoneOffset.UTC).getDayOfWeek();
            long[] row = agg.get(dow);
            row[0]++;
            if (a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE) {
                row[2]++;
            }
        }
        for (Grade g : grades) {
            if (g.getGradedAt() == null) continue;
            DayOfWeek dow = g.getGradedAt().atOffset(ZoneOffset.UTC).getDayOfWeek();
            agg.get(dow)[1]++;
        }
        List<WeeklyActivityPoint> out = new ArrayList<>(7);
        for (DayOfWeek d : new DayOfWeek[]{
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY}) {
            long[] row = agg.get(d);
            int engagement = row[0] == 0 ? 0 : (int) Math.round(100.0 * row[2] / row[0]);
            out.add(new WeeklyActivityPoint(d.name(), row[0], row[1], engagement));
        }
        return out;
    }

    private static final int ATTENDANCE_WEEKS = 8;
    private static final DateTimeFormatter WEEK_LABEL =
            DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

    private List<AttendanceWeekPoint> attendanceAnalytics() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate firstWeekStart = today
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .minusWeeks(ATTENDANCE_WEEKS - 1L);
        Instant since = firstWeekStart.atStartOfDay(ZoneOffset.UTC).toInstant();

        List<Attendance> records = attendanceRepository.findAllByMarkedAtAfter(since);

        // Ordered buckets keyed by the Monday that starts each week.
        Map<LocalDate, long[]> buckets = new LinkedHashMap<>();
        for (int i = 0; i < ATTENDANCE_WEEKS; i++) {
            buckets.put(firstWeekStart.plusWeeks(i), new long[4]); // [present, absent, late, excused]
        }
        for (Attendance a : records) {
            if (a.getMarkedAt() == null) continue;
            LocalDate weekStart = a.getMarkedAt().atOffset(ZoneOffset.UTC).toLocalDate()
                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            long[] row = buckets.get(weekStart);
            if (row == null) continue;
            switch (a.getStatus()) {
                case PRESENT -> row[0]++;
                case ABSENT -> row[1]++;
                case LATE -> row[2]++;
                case EXCUSED -> row[3]++;
            }
        }

        List<AttendanceWeekPoint> out = new ArrayList<>(ATTENDANCE_WEEKS);
        for (Map.Entry<LocalDate, long[]> e : buckets.entrySet()) {
            long[] row = e.getValue();
            long present = row[0];
            long absent = row[1];
            long late = row[2];
            long excused = row[3];
            // Rate = attended (present + late) over sessions that counted toward
            // attendance (excused absences are not penalised, so they are excluded).
            long denom = present + late + absent;
            BigDecimal rate = denom == 0
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(100.0 * (present + late) / denom)
                            .setScale(1, RoundingMode.HALF_UP);
            out.add(new AttendanceWeekPoint(
                    e.getKey().format(WEEK_LABEL), rate, present, absent, late, excused));
        }
        return out;
    }

    private List<Insight> institutionInsights(List<StudentMetrics> all, Double avg, long atRiskCount) {
        List<Insight> out = new ArrayList<>();
        Instant now = Instant.now();

        if (avg != null) {
            out.add(new Insight(
                    "avg-score",
                    "Composite average",
                    String.format("Institution-wide composite at %.1f", avg),
                    relativeTime(now, now),
                    "growth"));
        }

        out.add(new Insight(
                "at-risk-count",
                "At-risk watchlist",
                atRiskCount + " students currently below the risk threshold",
                relativeTime(now, now.minus(Duration.ofMinutes(45))),
                atRiskCount > 0 ? "alert" : "growth"));

        Instant weekAgo = now.minus(7, ChronoUnit.DAYS);
        long recentGrades = gradeRepository.findAllByGradedAtAfter(weekAgo).size();
        out.add(new Insight(
                "submissions-week",
                "Submissions this week",
                recentGrades + " assignments graded in the last 7 days",
                relativeTime(now, now.minus(Duration.ofHours(2))),
                "grade"));

        List<Attendance> recentAttendance = attendanceRepository.findAllByMarkedAtAfter(weekAgo);
        long present = recentAttendance.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT
                        || a.getStatus() == AttendanceStatus.LATE)
                .count();
        int attendanceRate = recentAttendance.isEmpty()
                ? 0
                : (int) Math.round(100.0 * present / recentAttendance.size());
        out.add(new Insight(
                "attendance-week",
                "Weekly attendance",
                attendanceRate + "% present across all groups this week",
                relativeTime(now, now.minus(Duration.ofHours(5))),
                "attendance"));

        long lowAttendance = all.stream()
                .filter(m -> m.getAttendanceNorm() != null
                        && m.getAttendanceNorm().compareTo(BigDecimal.valueOf(70)) < 0)
                .count();
        if (lowAttendance > 0) {
            out.add(new Insight(
                    "low-attendance",
                    "Behavior review",
                    lowAttendance + " students with attendance below 70%",
                    relativeTime(now, now.minus(Duration.ofDays(1))),
                    "behavior"));
        }

        return out;
    }

    private static void addBucket(double[] sums, int[] counts, int idx, BigDecimal v) {
        if (v == null) return;
        sums[idx] += v.doubleValue();
        counts[idx]++;
    }

    private static BigDecimal bucketAvg(double[] sums, int[] counts, int idx) {
        if (counts[idx] == 0) return null;
        return BigDecimal.valueOf(sums[idx] / counts[idx]).setScale(2, RoundingMode.HALF_UP);
    }

    private static String relativeTime(Instant now, Instant when) {
        long minutes = Math.max(0, Duration.between(when, now).toMinutes());
        if (minutes < 60) return Math.max(1, minutes) + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        return days + "d ago";
    }
}
