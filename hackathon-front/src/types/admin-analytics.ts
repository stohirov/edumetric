export type KpiFormat = "number" | "percent" | "currency" | "decimal";

export interface AdminKpi {
  id: string;
  label: string;
  value: number;
  format: KpiFormat;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
}

export interface ScoreDistributionBucket {
  grade: string;
  count: number;
  percentage: number;
}

export interface AttendanceAnalyticsPoint {
  week: string;
  rate: number;
  present: number;
  absent: number;
  late: number;
}

export interface TopGroup {
  id: string;
  name: string;
  department: string;
  avgScore: number;
  attendance: number;
  students: number;
  trend: number;
}

export interface AtRiskStudentRow {
  id: string;
  name: string;
  group: string;
  score: number;
  attendance: number;
  riskScore: number;
}

export interface TeacherActivityItem {
  id: string;
  teacherName: string;
  action: string;
  detail: string;
  timestamp: string;
  type: "grades" | "attendance" | "report" | "enrollment";
}

export interface AdminAnalyticsData {
  kpis: AdminKpi[];
  scoreDistribution: ScoreDistributionBucket[];
  attendanceAnalytics: AttendanceAnalyticsPoint[];
  topGroups: TopGroup[];
  atRiskStudents: AtRiskStudentRow[];
  teacherActivity: TeacherActivityItem[];
}
