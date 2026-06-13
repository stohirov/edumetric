// Types for the reports vertical slice (CSV export + printable progress report).
// Mirrors com.edumetric.backend.reports.ProgressReportDto (camelCase wire shape).

export interface ProgressMetricsSummary {
  composite: number | null;
  gradesNorm: number | null;
  attendanceNorm: number | null;
  practicalNorm: number | null;
  behaviorNorm: number | null;
  activityNorm: number | null;
  growthBonus: number | null;
  consistencyBonus: number | null;
  sampleSize: number;
  formulaVersion: string;
  computedAt: string;
  insufficientData: boolean;
}

export interface ProgressTrendPoint {
  date: string;
  composite: number | null;
}

export interface ProgressAttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercent: number;
}

export interface ProgressGradeRow {
  assignment: string;
  value: number | null;
  max: number | null;
  gradedAt: string;
}

export interface ProgressReportDto {
  studentId: number;
  studentName: string;
  studentEmail: string;
  groupId: number | null;
  groupName: string | null;
  metrics: ProgressMetricsSummary | null;
  trend: ProgressTrendPoint[];
  attendance: ProgressAttendanceSummary;
  grades: ProgressGradeRow[];
}
