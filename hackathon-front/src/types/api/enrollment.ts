// Mirrors com.edumetric.backend.enrollment DTOs

export type EnrollmentStatus =
  | "ACTIVE"
  | "WITHDRAWN"
  | "TRANSFERRED"
  | "COMPLETED";

export interface EnrollmentDto {
  id: number;
  studentId: number;
  studentName: string;
  groupId: number;
  groupName: string;
  status: EnrollmentStatus;
  enrolledAt: string; // ISO date
  endedAt: string | null;
  reason: string | null;
}

export interface EnrollRequest {
  studentId: number;
  groupId: number;
  reason?: string;
}

export interface TransferRequest {
  studentId: number;
  groupId: number;
  reason?: string;
}

export interface WithdrawRequest {
  studentId: number;
  reason?: string;
}
