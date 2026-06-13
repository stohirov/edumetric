import { api } from "./client";
import type {
  FormulaConfigDto,
  FormulaPreviewDto,
  StudentMetricsDto,
  TrendPointDto,
  UpdateFormulaRequest,
} from "@/types/api";

export function getStudentMetrics(
  studentId: number,
): Promise<StudentMetricsDto> {
  return api.get<StudentMetricsDto>(`/students/${studentId}/metrics`);
}

export function getStudentMetricsTrend(
  studentId: number,
): Promise<TrendPointDto[]> {
  return api.get<TrendPointDto[]>(`/students/${studentId}/metrics/trend`);
}

export function recomputeStudentMetrics(
  studentId: number,
): Promise<StudentMetricsDto> {
  return api.post<StudentMetricsDto>(`/metrics/recompute/${studentId}`);
}

export function recomputeAllMetrics(): Promise<Record<string, unknown>> {
  return api.post<Record<string, unknown>>("/metrics/recompute-all");
}

export function getFormula(): Promise<FormulaConfigDto> {
  return api.get<FormulaConfigDto>("/metrics/formula");
}

export function updateFormula(
  payload: UpdateFormulaRequest,
): Promise<FormulaConfigDto> {
  return api.put<FormulaConfigDto>("/metrics/formula", payload);
}

export function previewFormula(
  payload: UpdateFormulaRequest,
): Promise<FormulaPreviewDto> {
  return api.post<FormulaPreviewDto>("/metrics/formula/preview", payload);
}
