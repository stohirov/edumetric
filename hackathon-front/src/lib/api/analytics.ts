import { api } from "./client";
import type {
  AdminDashboardDto,
  AtRiskStudentDto,
  CohortComparisonDto,
  GroupAnalyticsDto,
  TeacherDashboardDto,
} from "@/types/api";

export function getAdminDashboard(): Promise<AdminDashboardDto> {
  return api.get<AdminDashboardDto>("/analytics/admin/dashboard");
}

export function getTeacherDashboard(): Promise<TeacherDashboardDto> {
  return api.get<TeacherDashboardDto>("/analytics/teacher/dashboard");
}

export function getGroupAnalytics(id: number): Promise<GroupAnalyticsDto> {
  return api.get<GroupAnalyticsDto>(`/analytics/groups/${id}`);
}

export function getAtRiskStudents(): Promise<AtRiskStudentDto[]> {
  return api.get<AtRiskStudentDto[]>("/analytics/at-risk");
}

export function getCohortComparison(): Promise<CohortComparisonDto> {
  return api.get<CohortComparisonDto>("/analytics/cohorts");
}
