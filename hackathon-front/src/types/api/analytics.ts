// Mirrors com.edumetric.backend.analytics.dto

export interface AdminKpis {
  studentCount: number;
  groupCount: number;
  teacherCount: number;
  averageScore: number;
  atRiskCount: number;
}

export interface HistogramBucket {
  low: number;
  high: number;
  count: number;
}

export interface GroupSummary {
  groupId: number;
  groupName: string;
  studentCount: number;
  averageScore: number;
}

export interface TeacherActivity {
  teacherId: number;
  fullName: string;
  pointsLast7Days: number;
}

export interface TrendPoint {
  monthKey: string;
  compositeAvg: number | null;
  attendanceAvg: number | null;
  assignmentsAvg: number | null;
}

export interface WeeklyActivityPoint {
  weekdayKey: string;
  sessions: number;
  submissions: number;
  engagementPercent: number;
}

export interface AttendanceWeekPoint {
  week: string;
  rate: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface InstitutionInsightDto {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: string;
}

export interface AdminDashboardDto {
  kpis: AdminKpis;
  scoreDistribution: HistogramBucket[];
  topGroups: GroupSummary[];
  teacherActivity: TeacherActivity[];
  growthTrend: TrendPoint[];
  weeklyActivity: WeeklyActivityPoint[];
  attendanceAnalytics: AttendanceWeekPoint[];
  insights: InstitutionInsightDto[];
}

export interface TeacherKpis {
  studentCount: number;
  groupCount: number;
  averageScore: number | null;
  atRiskCount: number;
}

export interface TeacherDashboardDto {
  kpis: TeacherKpis;
  scoreDistribution: HistogramBucket[];
  groups: GroupSummary[];
}

export interface StudentScore {
  studentId: number;
  fullName: string;
  compositeScore: number;
}

export interface GroupAnalyticsDto {
  groupId: number;
  groupName: string;
  studentCount: number;
  averageScore: number;
  averageGrades: number;
  averageAttendance: number;
  averagePractical: number;
  averageBehavior: number;
  averageActivity: number;
  students: StudentScore[];
}

export interface AtRiskStudentDto {
  studentId: number;
  fullName: string;
  email: string | null;
  groupId: number;
  groupName: string;
  compositeScore: number;
  attendanceNorm: number;
  reason: string;
}

export interface CohortRow {
  groupId: number;
  groupName: string;
  studentCount: number;
  avgComposite: number | null;
  avgAttendance: number | null;
  avgGrades: number | null;
  atRiskCount: number;
}

export interface LongitudinalPoint {
  label: string;
  avgComposite: number | null;
}

export interface CohortComparisonDto {
  cohorts: CohortRow[];
  longitudinal: LongitudinalPoint[];
}
