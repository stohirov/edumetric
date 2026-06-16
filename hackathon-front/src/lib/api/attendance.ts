import { api } from "./client";
import type {
  AttendanceDto,
  AttendancePolicyDto,
  AttendanceReportDto,
  AttendanceStatusApi,
  BulkAttendanceRequest,
  CheckinSubmitRequest,
  CreateJustificationRequest,
  GroupAttendanceReportDto,
  JustificationDto,
  LessonCheckinDto,
  PageResponse,
  UpdateAttendancePolicyRequest,
} from "@/types/api";

export function bulkUpsertAttendance(
  payload: BulkAttendanceRequest,
): Promise<AttendanceDto[]> {
  return api.post<AttendanceDto[]>("/attendance/bulk", payload);
}

export function markAll(
  lessonId: number,
  status: AttendanceStatusApi = "PRESENT",
  onlyUnmarked = true,
): Promise<AttendanceDto[]> {
  return api.post<AttendanceDto[]>(`/attendance/lesson/${lessonId}/mark-all`, undefined, {
    query: { status, onlyUnmarked },
  });
}

// ----- Self check-in -----
export function openCheckin(lessonId: number): Promise<LessonCheckinDto> {
  return api.post<LessonCheckinDto>(`/attendance/checkin/open/${lessonId}`);
}
export function closeCheckin(lessonId: number): Promise<LessonCheckinDto> {
  return api.post<LessonCheckinDto>(`/attendance/checkin/close/${lessonId}`);
}
export function checkinStatus(lessonId: number): Promise<LessonCheckinDto> {
  return api.get<LessonCheckinDto>(`/attendance/checkin/status/${lessonId}`);
}
export function submitCheckin(payload: CheckinSubmitRequest): Promise<AttendanceDto> {
  return api.post<AttendanceDto>("/attendance/checkin/submit", payload);
}

// ----- Absence justifications -----
export function submitJustification(
  payload: CreateJustificationRequest,
): Promise<JustificationDto> {
  return api.post<JustificationDto>("/justifications", payload);
}
export function myJustifications(): Promise<JustificationDto[]> {
  return api
    .get<PageResponse<JustificationDto>>("/justifications/me", {
      query: { size: 200 },
    })
    .then((p) => p.items);
}
export function pendingJustifications(): Promise<JustificationDto[]> {
  return api
    .get<PageResponse<JustificationDto>>("/justifications", {
      query: { size: 200 },
    })
    .then((p) => p.items);
}
export function approveJustification(id: number): Promise<JustificationDto> {
  return api.post<JustificationDto>(`/justifications/${id}/approve`);
}
export function rejectJustification(id: number, note?: string): Promise<JustificationDto> {
  return api.post<JustificationDto>(`/justifications/${id}/reject`, { note });
}

// ----- Reports -----
export function studentReport(studentId: number): Promise<AttendanceReportDto> {
  return api.get<AttendanceReportDto>(`/attendance/report/student/${studentId}`);
}
export function myReport(): Promise<AttendanceReportDto> {
  return api.get<AttendanceReportDto>("/attendance/report/me");
}
export function groupReport(groupId: number): Promise<GroupAttendanceReportDto> {
  return api.get<GroupAttendanceReportDto>(`/attendance/report/group/${groupId}`);
}

// ----- Policy -----
export function getPolicy(): Promise<AttendancePolicyDto> {
  return api.get<AttendancePolicyDto>("/attendance/policy");
}
export function updatePolicy(
  payload: UpdateAttendancePolicyRequest,
): Promise<AttendancePolicyDto> {
  return api.patch<AttendancePolicyDto>("/attendance/policy", payload);
}
