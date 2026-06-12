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

// ----- Self check-in -----
export interface LessonCheckinDto {
  lessonId: number;
  code: string | null;
  open: boolean;
  openedAt: string | null;
  expiresAt: string | null;
}
export interface CheckinSubmitRequest {
  code: string;
}

// ----- Absence justifications -----
export type JustificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface JustificationDto {
  id: number;
  studentId: number;
  studentName: string;
  lessonId: number;
  lessonTopic: string;
  courseName: string;
  reason: string;
  status: JustificationStatus;
  createdAt: string;
  decidedAt: string | null;
}
export interface CreateJustificationRequest {
  lessonId: number;
  reason: string;
}

// ----- Reports -----
export interface AttendanceReportDto {
  studentId: number;
  studentName: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  total: number;
  attendancePercent: number | null;
  atRisk: boolean;
  minPercent: number;
}
export interface GroupAttendanceReportDto {
  groupId: number;
  groupName: string;
  groupAveragePercent: number | null;
  students: AttendanceReportDto[];
}

// ----- Policy -----
export interface AttendancePolicyDto {
  minAttendancePercent: number;
  consecutiveAbsenceLimit: number;
  notifyOnAbsence: boolean;
}
export interface UpdateAttendancePolicyRequest {
  minAttendancePercent?: number;
  consecutiveAbsenceLimit?: number;
  notifyOnAbsence?: boolean;
}
