// Mirrors com.edumetric.backend.grades.dto

export type AssignmentType = "THEORY" | "PRACTICAL" | "PROJECT" | "EXAM";

export interface GradeDto {
  id: number;
  studentId: number;
  studentName: string;
  assignmentId: number;
  assignmentName: string;
  value: number; // BigDecimal serialized as number
  maxValue: number;
  gradedByUserId: number;
  gradedAt: string; // Instant ISO
  comment: string | null;
}

export interface CreateGradeRequest {
  studentId: number;
  assignmentId: number;
  value: number;
  comment?: string;
}

export interface UpdateGradeRequest {
  value?: number;
  comment?: string;
}

export interface BulkGradeEntry {
  studentId: number;
  value: number;
  comment?: string;
}

export interface BulkGradeRequest {
  assignmentId: number;
  entries: BulkGradeEntry[];
}

export interface AssignmentDto {
  id: number;
  courseId: number;
  courseName: string;
  name: string;
  type: AssignmentType;
  maxValue: number;
  weight: number;
  dueDate: string | null; // LocalDate ISO (yyyy-MM-dd)
  categoryId: number | null;
}

export interface CreateAssignmentRequest {
  courseId: number;
  name: string;
  type: AssignmentType;
  maxValue: number;
  weight?: number;
  dueDate?: string | null;
  categoryId?: number;
}

export interface UpdateAssignmentRequest {
  name?: string;
  type?: AssignmentType;
  maxValue?: number;
  weight?: number;
  dueDate?: string | null;
  // 0 clears the category.
  categoryId?: number;
}
