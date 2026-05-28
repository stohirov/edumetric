// Mirrors com.edumetric.backend.students.dto

import type { StudentMetricsDto, TrendPointDto } from "./metrics";
import type { GradeDto } from "./grades";
import type { AttendanceDto } from "./attendance";

export interface StudentDto {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  groupId: number | null;
  groupName: string | null;
  enrolledAt: string; // LocalDate ISO yyyy-MM-dd
}

export interface CreateStudentRequest {
  email: string;
  password: string;
  fullName: string;
  groupId: number;
  enrolledAt?: string;
}

export interface UpdateStudentRequest {
  fullName?: string;
  groupId?: number;
  enrolledAt?: string;
}

export interface BreakdownDto {
  grades: number;
  attendance: number;
  practical: number;
  behavior: number;
  activity: number;
  growth: number;
  consistency: number;
}

export interface GrowthAreaDto {
  dimension: string;
  score: number;
  groupAverage: number;
}

export interface PercentileDto {
  groupId: number;
  percentile: number;
  groupSize: number;
}

export interface StudentDashboardDto {
  student: StudentDto;
  metrics: StudentMetricsDto;
  trend: TrendPointDto[];
  breakdown: BreakdownDto;
  recentGrades: GradeDto[];
  recentAttendance: AttendanceDto[];
  growthAreas: GrowthAreaDto[];
  groupPercentile: PercentileDto;
}
