export type PerformanceDimensionKey =
  | "grades"
  | "attendance"
  | "practical"
  | "behavior"
  | "activity";

export interface StudentAnalyticsProfile {
  id: string;
  fullName: string;
  email: string;
  group: string;
  semester: string;
  compositeScore: number;
  growthPercent: number;
  percentileRank: string;
  initials: string;
}

export interface RadarDimensionData {
  dimension: string;
  key: PerformanceDimensionKey;
  student: number;
  group: number;
  fullMark: number;
}

export interface GrowthTrendPoint {
  week: string;
  score: number;
  groupAvg: number;
}

export interface PerformanceBreakdownItem {
  key: PerformanceDimensionKey;
  label: string;
  value: number;
  groupAvg: number;
  delta: number;
}

export interface GrowthAreaItem {
  key: PerformanceDimensionKey;
  dimension: string;
  score: number;
  groupAvg: number;
  gap: number;
  suggestion: string;
  severity: "warning" | "alert";
}

export interface RecentGradeEntry {
  id: string;
  course: string;
  title: string;
  grade: string;
  score: number;
  date: string;
  type: "exam" | "assignment" | "quiz";
}

export interface RecentAttendanceEntry {
  id: string;
  course: string;
  status: "present" | "absent" | "late" | "excused";
  date: string;
  time?: string;
}

export interface StudentAnalyticsDashboard {
  profile: StudentAnalyticsProfile;
  radar: RadarDimensionData[];
  growthTrend: GrowthTrendPoint[];
  performance: PerformanceBreakdownItem[];
  growthAreas: GrowthAreaItem[];
  recentGrades: RecentGradeEntry[];
  recentAttendance: RecentAttendanceEntry[];
}
