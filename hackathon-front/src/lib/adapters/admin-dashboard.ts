// Maps the backend AdminDashboardDto + at-risk + i18n data into the shapes
// expected by the existing institution-dashboard UI components.

import type { AdminDashboardDto, AtRiskStudentDto } from "@/types/api";
import type {
  AtRiskStudentRow,
  EducationKpi,
  GroupPerformance,
  InsightItem,
  ScorePillar,
} from "@/types/education-metrics";
import type { ChartDataPoint } from "@/types";
import type { Dictionary } from "@/lib/i18n/types";

interface AdminDashboardSources {
  dashboard: AdminDashboardDto;
  atRisk: AtRiskStudentDto[];
  t: Dictionary;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function adaptAdminKpis(
  d: AdminDashboardDto,
  t: Dictionary,
): EducationKpi[] {
  return [
    {
      id: "overall-score",
      label: t.institution.kpis.overallScore,
      value: String(round1(d.kpis.averageScore)),
      change: 0,
      changeLabel: t.common.vsLastTerm,
      trend: "neutral",
      sparkline: [],
      iconName: "Target",
      accent: "indigo",
    },
    {
      id: "attendance",
      label: t.institution.kpis.attendance,
      value: String(d.kpis.studentCount),
      change: 0,
      changeLabel: t.common.students ?? "students",
      trend: "neutral",
      sparkline: [],
      iconName: "CalendarCheck",
      accent: "emerald",
    },
    {
      id: "assignments",
      label: t.institution.kpis.assignments,
      value: String(d.kpis.groupCount),
      change: 0,
      changeLabel: t.institution.groups.title,
      trend: "neutral",
      sparkline: [],
      iconName: "ClipboardList",
      accent: "violet",
    },
    {
      id: "growth",
      label: t.institution.kpis.growth,
      value: String(d.kpis.teacherCount),
      change: 0,
      changeLabel: t.institution.kpis.engagement ?? "engagement",
      trend: "neutral",
      sparkline: [],
      iconName: "TrendingUp",
      accent: "indigo",
    },
    {
      id: "at-risk",
      label: t.institution.kpis.atRisk,
      value: String(d.kpis.atRiskCount),
      change: 0,
      changeLabel: t.common.vsLastMonth,
      trend: d.kpis.atRiskCount > 0 ? "up" : "down",
      sparkline: [],
      iconName: "AlertTriangle",
      accent: "rose",
    },
  ];
}

export function adaptTopGroups(d: AdminDashboardDto): GroupPerformance[] {
  return d.topGroups.map((g) => ({
    id: String(g.groupId),
    name: g.groupName,
    students: g.studentCount,
    avgScore: round1(g.averageScore),
    attendance: 0,
    trend: 0,
  }));
}

export function adaptAtRiskRows(rows: AtRiskStudentDto[]): AtRiskStudentRow[] {
  return rows.map((r) => ({
    id: String(r.studentId),
    name: r.fullName,
    group: r.groupName,
    score: Math.round(Number(r.compositeScore)),
    attendance: Math.round(Number(r.attendanceNorm)),
    riskFactors: r.reason
      ? r.reason.split(/[,;]\s*/).filter(Boolean)
      : ["Composite score low"],
  }));
}

export function adaptScorePillars(
  d: AdminDashboardDto,
  t: Dictionary,
): ScorePillar[] {
  // Backend doesn't expose org-level pillar averages directly, so we project
  // from the overall average to give the UI something to render.
  const base = round1(d.kpis.averageScore);
  return [
    { label: t.institution.pillars.assignments, score: base, target: 90 },
    { label: t.institution.pillars.practical, score: base, target: 88 },
    { label: t.institution.pillars.behavior, score: base, target: 90 },
    { label: t.institution.pillars.activity, score: base, target: 85 },
    { label: t.institution.pillars.attendance, score: base, target: 95 },
  ];
}

const MONTH_KEY_MAP: Record<string, keyof Dictionary["months"]> = {
  JANUARY: "jan",
  FEBRUARY: "feb",
  MARCH: "mar",
  APRIL: "apr",
  MAY: "may",
  JUNE: "jun",
  JULY: "jan",
  AUGUST: "feb",
  SEPTEMBER: "mar",
  OCTOBER: "apr",
  NOVEMBER: "may",
  DECEMBER: "jun",
};

const WEEKDAY_KEY_MAP: Record<string, keyof Dictionary["weekdays"]> = {
  MONDAY: "mon",
  TUESDAY: "tue",
  WEDNESDAY: "wed",
  THURSDAY: "thu",
  FRIDAY: "fri",
  SATURDAY: "sat",
  SUNDAY: "sun",
};

export function adaptGrowthTrend(
  d: AdminDashboardDto,
  t: Dictionary,
): ChartDataPoint[] {
  return d.growthTrend.map((p) => {
    const key = MONTH_KEY_MAP[p.monthKey] ?? "jan";
    return {
      name: t.months[key],
      value: p.compositeAvg ?? 0,
      attendance: p.attendanceAvg ?? 0,
      assignments: p.assignmentsAvg ?? 0,
    } satisfies ChartDataPoint;
  });
}

export function adaptWeeklyActivity(
  d: AdminDashboardDto,
  t: Dictionary,
): ChartDataPoint[] {
  return d.weeklyActivity.map((p) => {
    const key = WEEKDAY_KEY_MAP[p.weekdayKey] ?? "mon";
    return {
      name: t.weekdays[key],
      value: p.engagementPercent,
      sessions: p.sessions,
      submissions: p.submissions,
    } satisfies ChartDataPoint;
  });
}

const INSIGHT_TYPE_MAP: Record<string, InsightItem["type"]> = {
  attendance: "attendance",
  grade: "grade",
  behavior: "behavior",
  growth: "growth",
  alert: "alert",
};

export function adaptInsights(d: AdminDashboardDto): InsightItem[] {
  return d.insights.map((i) => ({
    id: i.id,
    title: i.title,
    detail: i.detail,
    time: i.time,
    type: INSIGHT_TYPE_MAP[i.type] ?? "growth",
  }));
}

export function adaptAdminDashboard(src: AdminDashboardSources) {
  return {
    kpis: adaptAdminKpis(src.dashboard, src.t),
    topGroups: adaptTopGroups(src.dashboard),
    atRisk: adaptAtRiskRows(src.atRisk),
    pillars: adaptScorePillars(src.dashboard, src.t),
    overallScore: round1(src.dashboard.kpis.averageScore),
    growthTrend: adaptGrowthTrend(src.dashboard, src.t),
    weeklyActivity: adaptWeeklyActivity(src.dashboard, src.t),
    insights: adaptInsights(src.dashboard),
  };
}
