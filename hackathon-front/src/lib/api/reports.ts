import { api, API_BASE_URL, getToken } from "./client";
import type { ProgressReportDto } from "@/types/api/reports";

export function getStudentProgress(id: number): Promise<ProgressReportDto> {
  return api.get<ProgressReportDto>(`/reports/student/${id}/progress`);
}

export function getMyProgress(): Promise<ProgressReportDto> {
  return api.get<ProgressReportDto>("/reports/me/progress");
}

// CSV endpoints are NOT wrapped in ApiResponse — the api client unwraps JSON,
// so we fetch the raw blob ourselves (with the bearer token) and trigger a
// browser download.
async function downloadCsv(path: string, filename: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadMetricsCsv(): Promise<void> {
  return downloadCsv("/reports/metrics.csv", "metrics.csv");
}

export function downloadStudentGradesCsv(id: number): Promise<void> {
  return downloadCsv(`/reports/student/${id}/grades.csv`, `student-${id}-grades.csv`);
}
