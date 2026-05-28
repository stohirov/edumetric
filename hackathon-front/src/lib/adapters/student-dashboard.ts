// Maps backend StudentDashboardDto -> the StudentAnalyticsDashboard shape
// used by the existing student dashboard UI components.

import type {
  AttendanceDto,
  GradeDto,
  StudentDashboardDto,
  TrendPointDto,
} from "@/types/api";
import type {
  GrowthAreaItem,
  GrowthTrendPoint,
  PerformanceBreakdownItem,
  PerformanceDimensionKey,
  RadarDimensionData,
  RecentAttendanceEntry,
  RecentGradeEntry,
  StudentAnalyticsDashboard,
  StudentAnalyticsProfile,
} from "@/types/student-analytics";

const DIMENSION_LABELS: Record<PerformanceDimensionKey, string> = {
  grades: "Grades",
  attendance: "Attendance",
  practical: "Practical",
  behavior: "Behavior",
  activity: "Activity",
};

const ALL_DIMENSIONS: PerformanceDimensionKey[] = [
  "grades",
  "attendance",
  "practical",
  "behavior",
  "activity",
];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string | undefined {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return undefined;
  }
}

function percentileLabel(percentile: number, groupSize: number): string {
  if (groupSize <= 1) return "Group leader";
  if (percentile >= 90) return `Top ${100 - percentile}% in group`;
  if (percentile >= 75) return `Top quartile`;
  if (percentile >= 50) return `Above median`;
  if (percentile >= 25) return `Below median`;
  return `Bottom quartile`;
}

function growthPercentFromTrend(trend: TrendPointDto[]): number {
  if (trend.length < 2) return 0;
  const last = trend[trend.length - 1].compositeScore;
  const prev = trend[trend.length - 2].compositeScore;
  if (!prev) return 0;
  return round1(((last - prev) / prev) * 100);
}

function letterFromValue(value: number, maxValue: number): string {
  if (!maxValue) return "—";
  const pct = (value / maxValue) * 100;
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

function gradeTypeFromName(name: string): RecentGradeEntry["type"] {
  const lower = name.toLowerCase();
  if (lower.includes("exam") || lower.includes("midterm") || lower.includes("final"))
    return "exam";
  if (lower.includes("quiz")) return "quiz";
  return "assignment";
}

function attendanceStatusLower(
  status: AttendanceDto["status"],
): RecentAttendanceEntry["status"] {
  return status.toLowerCase() as RecentAttendanceEntry["status"];
}

function mapGrade(g: GradeDto): RecentGradeEntry {
  const percent = g.maxValue ? round1((g.value / g.maxValue) * 100) : 0;
  return {
    id: String(g.id),
    course: g.assignmentName,
    title: g.assignmentName,
    grade: letterFromValue(Number(g.value), Number(g.maxValue)),
    score: percent,
    date: formatDate(g.gradedAt),
    type: gradeTypeFromName(g.assignmentName),
  };
}

function mapAttendance(a: AttendanceDto): RecentAttendanceEntry {
  return {
    id: String(a.id),
    course: `Lesson #${a.lessonId}`,
    status: attendanceStatusLower(a.status),
    date: formatDate(a.markedAt),
    time: formatTime(a.markedAt),
  };
}

function buildPerformanceItems(
  d: StudentDashboardDto,
): PerformanceBreakdownItem[] {
  // Group averages keyed by lowercased dimension name from growthAreas[].
  const groupAvgByDimension = new Map<string, number>();
  for (const ga of d.growthAreas) {
    groupAvgByDimension.set(ga.dimension.toLowerCase(), Number(ga.groupAverage));
  }

  const dimensionValue: Record<PerformanceDimensionKey, number> = {
    grades: Number(d.metrics.gradesNorm),
    attendance: Number(d.metrics.attendanceNorm),
    practical: Number(d.metrics.practicalNorm),
    behavior: Number(d.metrics.behaviorNorm),
    activity: Number(d.metrics.activityNorm),
  };

  return ALL_DIMENSIONS.map((key) => {
    const value = round1(dimensionValue[key]);
    const groupAvg = round1(groupAvgByDimension.get(key) ?? value);
    return {
      key,
      label: DIMENSION_LABELS[key],
      value,
      groupAvg,
      delta: round1(value - groupAvg),
    };
  });
}

function buildRadar(items: PerformanceBreakdownItem[]): RadarDimensionData[] {
  return items.map((item) => ({
    dimension: item.label,
    key: item.key,
    student: item.value,
    group: item.groupAvg,
    fullMark: 100,
  }));
}

function buildGrowthTrend(trend: TrendPointDto[]): GrowthTrendPoint[] {
  if (trend.length === 0) return [];
  // Use the long-run average of each metric snapshot as a rough group baseline.
  const averageOf = (key: keyof TrendPointDto): number => {
    let sum = 0;
    let count = 0;
    for (const t of trend) {
      const raw = t[key];
      const v = typeof raw === "string" ? Number(raw) : (raw as number);
      if (!Number.isFinite(v)) continue;
      sum += v;
      count += 1;
    }
    return count ? sum / count : 0;
  };
  const groupAvg = round1(averageOf("compositeScore"));
  return trend.map((point, idx) => ({
    week: `W${idx + 1}`,
    score: round1(Number(point.compositeScore)),
    groupAvg,
  }));
}

function buildGrowthAreas(d: StudentDashboardDto): GrowthAreaItem[] {
  return d.growthAreas.map((g) => {
    const lower = g.dimension.toLowerCase();
    const key = (ALL_DIMENSIONS.find((k) => k === lower) ??
      "grades") as PerformanceDimensionKey;
    const score = round1(Number(g.score));
    const groupAvg = round1(Number(g.groupAverage));
    const gap = round1(Math.max(0, groupAvg - score));
    const severity: GrowthAreaItem["severity"] = gap >= 15 ? "alert" : "warning";
    return {
      key,
      dimension: DIMENSION_LABELS[key] ?? g.dimension,
      score,
      groupAvg,
      gap,
      suggestion: severity === "alert"
        ? `Significant gap vs group average. Focus on ${DIMENSION_LABELS[key].toLowerCase()} to close ${gap} points.`
        : `Small gap vs group average. Steady improvement in ${DIMENSION_LABELS[key].toLowerCase()} will help.`,
      severity,
    };
  });
}

function buildProfile(d: StudentDashboardDto): StudentAnalyticsProfile {
  return {
    id: String(d.student.id),
    fullName: d.student.fullName,
    email: d.student.email,
    group: d.student.groupName ?? "—",
    semester: "",
    compositeScore: round1(Number(d.metrics.compositeScore)),
    growthPercent: growthPercentFromTrend(d.trend),
    percentileRank: percentileLabel(
      d.groupPercentile?.percentile ?? 0,
      d.groupPercentile?.groupSize ?? 0,
    ),
    initials: initialsFromName(d.student.fullName),
  };
}

export function adaptStudentDashboard(
  d: StudentDashboardDto,
): StudentAnalyticsDashboard {
  const performance = buildPerformanceItems(d);
  return {
    profile: buildProfile(d),
    radar: buildRadar(performance),
    growthTrend: buildGrowthTrend(d.trend),
    performance,
    growthAreas: buildGrowthAreas(d),
    recentGrades: d.recentGrades.map(mapGrade),
    recentAttendance: d.recentAttendance.map(mapAttendance),
  };
}
