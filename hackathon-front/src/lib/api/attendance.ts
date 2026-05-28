import { api } from "./client";
import type { AttendanceDto, BulkAttendanceRequest } from "@/types/api";

export function bulkUpsertAttendance(
  payload: BulkAttendanceRequest,
): Promise<AttendanceDto[]> {
  return api.post<AttendanceDto[]>("/attendance/bulk", payload);
}
