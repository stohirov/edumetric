// Maps backend AdminDashboardDto + at-risk -> the AdminAnalyticsData shape
// used by the analytics dashboard UI.

import type {
  AdminDashboardDto,
  AtRiskStudentDto,
  HistogramBucket,
} from "@/types/api";
import type {
  AdminAnalyticsData,
  AdminKpi,
  AtRiskStudentRow,
  AttendanceAnalyticsPoint,
  ScoreDistributionBucket,
  TeacherActivityItem,
  TopGroup,
} from "@/types/admin-analytics";

function letterForRange(bucket: HistogramBucket): string {
  const mid = (bucket.low + bucket.high) / 2;
  if (mid >= 90) return "A";
  if (mid >= 80) return "B";
  if (mid >= 70) return "C";
  if (mid >= 60) return "D";
  return "F";
}

function adaptKpis(d: AdminDashboardDto): AdminKpi[] {
  return [
    {
      id: "students",
      label: "Total students",
      value: d.kpis.studentCount,
      format: "number",
      change: 0,
      changeLabel: "across institution",
      trend: "neutral",
    },
    {
      id: "avg-score",
      label: "Average composite score",
      value: Math.round(d.kpis.averageScore * 10) / 10,
      format: "decimal",
      change: 0,
      changeLabel: "vs last term",
      trend: "neutral",
    },
    {
      id: "at-risk",
      label: "At-risk students",
      value: d.kpis.atRiskCount,
      format: "number",
      change: 0,
      changeLabel: "intervention queue",
      trend: d.kpis.atRiskCount > 0 ? "down" : "up",
    },
    {
      id: "groups",
      label: "Active groups",
      value: d.kpis.groupCount,
      format: "number",
      change: 0,
      changeLabel: "this term",
      trend: "neutral",
    },
    {
      id: "teachers",
      label: "Teachers",
      value: d.kpis.teacherCount,
      format: "number",
      change: 0,
      changeLabel: "faculty",
      trend: "neutral",
    },
    {
      id: "retention",
      label: "At-risk share",
      value:
        d.kpis.studentCount > 0
          ? Math.round((d.kpis.atRiskCount / d.kpis.studentCount) * 1000) / 10
          : 0,
      format: "percent",
      change: 0,
      changeLabel: "of student body",
      trend: "neutral",
    },
  ];
}

function adaptScoreDistribution(
  d: AdminDashboardDto,
): ScoreDistributionBucket[] {
  const total = d.scoreDistribution.reduce((sum, b) => sum + b.count, 0);
  return d.scoreDistribution.map((b) => ({
    grade: letterForRange(b),
    count: b.count,
    percentage: total > 0 ? Math.round((b.count / total) * 1000) / 10 : 0,
  }));
}

function adaptTopGroups(d: AdminDashboardDto): TopGroup[] {
  return d.topGroups.map((g) => ({
    id: String(g.groupId),
    name: g.groupName,
    department: "—",
    avgScore: Math.round(g.averageScore * 10) / 10,
    attendance: 0,
    students: g.studentCount,
    trend: 0,
  }));
}

function adaptAtRisk(rows: AtRiskStudentDto[]): AtRiskStudentRow[] {
  return rows.map((r) => ({
    id: String(r.studentId),
    name: r.fullName,
    group: r.groupName,
    score: Math.round(Number(r.compositeScore)),
    attendance: Math.round(Number(r.attendanceNorm)),
    riskScore: Math.max(
      0,
      Math.min(100, Math.round(100 - Number(r.compositeScore))),
    ),
  }));
}

function adaptTeacherActivity(d: AdminDashboardDto): TeacherActivityItem[] {
  return d.teacherActivity.map((t) => ({
    id: String(t.teacherId),
    teacherName: t.fullName,
    action: `Logged ${t.pointsLast7Days} grading actions`,
    detail: "Last 7 days",
    timestamp: "recent",
    type: "grades",
  }));
}

function adaptAttendanceAnalytics(
  d: AdminDashboardDto,
): AttendanceAnalyticsPoint[] {
  return (d.attendanceAnalytics ?? []).map((p) => ({
    week: p.week,
    rate: Number(p.rate),
    present: p.present,
    absent: p.absent,
    late: p.late,
  }));
}

export function adaptAdminAnalytics(
  dashboard: AdminDashboardDto,
  atRisk: AtRiskStudentDto[],
): AdminAnalyticsData {
  return {
    kpis: adaptKpis(dashboard),
    scoreDistribution: adaptScoreDistribution(dashboard),
    attendanceAnalytics: adaptAttendanceAnalytics(dashboard),
    topGroups: adaptTopGroups(dashboard),
    atRiskStudents: adaptAtRisk(atRisk),
    teacherActivity: adaptTeacherActivity(dashboard),
  };
}
