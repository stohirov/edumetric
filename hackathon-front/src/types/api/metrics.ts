// Mirrors com.edumetric.backend.metrics.dto

export interface StudentMetricsDto {
  studentId: number;
  compositeScore: number;
  gradesNorm: number;
  attendanceNorm: number;
  practicalNorm: number;
  behaviorNorm: number;
  activityNorm: number;
  growthBonus: number;
  consistencyBonus: number;
  formulaVersion: string;
  sampleSize: number;
  insufficientData: boolean;
  computedAt: string; // Instant ISO
}

export interface TrendPointDto {
  date: string; // LocalDate
  compositeScore: number;
  gradesNorm: number;
  attendanceNorm: number;
  practicalNorm: number;
  behaviorNorm: number;
  activityNorm: number;
}

export interface FormulaConfigDto {
  id: number;
  version: string;
  weightGrades: number;
  weightAttendance: number;
  weightPractical: number;
  weightBehavior: number;
  weightActivity: number;
  weightGrowth: number;
  weightConsistency: number;
  active: boolean;
  createdAt: string;
}

export interface UpdateFormulaRequest {
  version: string;
  weightGrades: number;
  weightAttendance: number;
  weightPractical: number;
  weightBehavior: number;
  weightActivity: number;
  weightGrowth: number;
  weightConsistency: number;
}
