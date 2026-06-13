// Mirrors com.edumetric.backend.submissions.dto

export type SubmissionKind = "HOMEWORK" | "QUIZ";
export type SubmissionStatus = "SUBMITTED" | "GRADED";

export interface SubmissionDto {
  id: number;
  kind: SubmissionKind;
  status: SubmissionStatus;
  assignmentId: number | null;
  quizId: number | null;
  title: string;
  courseId: number;
  courseName: string;
  studentId: number;
  studentName: string;
  score: number | null;
  maxScore: number | null;
  percent: number | null;
  attemptCount: number;
  submittedAt: string;
  gradedAt: string | null;
}
