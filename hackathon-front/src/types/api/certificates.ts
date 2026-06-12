// Mirrors com.edumetric.backend.certificates DTOs

export interface CertificateDto {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  certificateCode: string;
  completedAt: string;
}

export interface CertificateVerificationDto {
  valid: boolean;
  studentName: string | null;
  courseName: string | null;
  completedAt: string | null;
  certificateCode: string;
}
