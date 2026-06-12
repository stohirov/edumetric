// Mirrors com.edumetric.backend.catalog DTOs

export type EnrollmentRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CatalogItemDto {
  groupId: number;
  groupName: string;
  courseId: number;
  courseName: string;
  courseDescription: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface EnrollmentRequestDto {
  id: number;
  studentId: number;
  studentName: string;
  groupId: number;
  groupName: string;
  courseName: string;
  status: EnrollmentRequestStatus;
  message: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface CreateEnrollmentRequestRequest {
  groupId: number;
  message?: string;
}
