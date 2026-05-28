// Mirrors com.edumetric.backend.attendance.dto

export type AttendanceStatusApi = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface AttendanceDto {
  id: number;
  studentId: number;
  studentName: string;
  lessonId: number;
  status: AttendanceStatusApi;
  markedByUserId: number;
  markedAt: string; // Instant ISO
  comment: string | null;
}

export interface BulkAttendanceEntry {
  studentId: number;
  status: AttendanceStatusApi;
  comment?: string;
}

export interface BulkAttendanceRequest {
  lessonId: number;
  entries: BulkAttendanceEntry[];
}
