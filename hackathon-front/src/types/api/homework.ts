// @/types/api/homework — mirrors com.edumetric.backend.homework.dto.*

import type { AssignmentType } from "./grades";

export type HomeworkStatus = "PENDING" | "SUBMITTED" | "GRADED";

export interface HomeworkAssignmentDto {
  assignmentId: number;
  name: string;
  type: AssignmentType;
  maxValue: number;
  dueDate: string | null; // LocalDate ISO (yyyy-MM-dd)
  courseName: string;
  status: HomeworkStatus;
  overdue: boolean;
  submitted: boolean;
  submittedAt: string | null; // Instant ISO
  hasFile: boolean;
  fileName: string | null;
  comment: string | null;
  graded: boolean;
  gradeValue: number | null;
}

export interface SubmissionDto {
  id: number;
  assignmentId: number;
  assignmentName: string;
  comment: string | null;
  hasFile: boolean;
  fileName: string | null;
  fileSize: number | null;
  contentType: string | null;
  submittedAt: string;
}

export interface SubmitHomeworkInput {
  comment?: string;
  file?: File | null;
}

/** One student's submission for an assignment, as the teacher sees it. */
export interface TeacherSubmissionDto {
  submissionId: number;
  studentId: number;
  studentName: string;
  submittedAt: string; // Instant ISO
  hasFile: boolean;
  fileName: string | null;
  fileSize: number | null;
  comment: string | null;
  graded: boolean;
  gradeValue: number | null;
}
