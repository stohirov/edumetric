// Mirrors com.edumetric.backend.{gradecategories,rubrics,feedback,appeals,transcripts,plagiarism,peerreview} DTOs

// ----- Grade categories -----
export interface GradeCategoryDto {
  id: number;
  courseId: number;
  name: string;
  weight: number;
  position: number;
}
export interface CreateGradeCategoryRequest {
  courseId: number;
  name: string;
  weight: number;
  position?: number;
}
export interface UpdateGradeCategoryRequest {
  name?: string;
  weight?: number;
  position?: number;
}

// ----- Rubrics -----
export interface RubricCriterionDto {
  id: number;
  label: string;
  maxPoints: number;
  position: number;
}
export interface RubricDto {
  id: number;
  assignmentId: number;
  name: string;
  criteria: RubricCriterionDto[];
}
export interface CriterionInput {
  label: string;
  maxPoints: number;
  position?: number;
}
export interface UpsertRubricRequest {
  assignmentId: number;
  name: string;
  criteria: CriterionInput[];
}
export interface RubricScoreInput {
  criterionId: number;
  points: number;
  comment?: string;
}
export interface ScoreRubricRequest {
  assignmentId: number;
  studentId: number;
  scores: RubricScoreInput[];
}
export interface RubricScoreDto {
  criterionId: number;
  studentId: number;
  points: number;
  comment: string | null;
}

// ----- Feedback -----
export interface FeedbackDto {
  id: number;
  assignmentId: number;
  studentId: number;
  authorName: string;
  body: string;
  createdAt: string;
}
export interface CreateFeedbackRequest {
  assignmentId: number;
  studentId: number;
  body: string;
}

// ----- Grade appeals -----
export type AppealStatus = "PENDING" | "RESOLVED" | "REJECTED";
export interface GradeAppealDto {
  id: number;
  assignmentId: number;
  assignmentName: string;
  courseName: string;
  studentId: number;
  studentName: string;
  reason: string;
  status: AppealStatus;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
}
export interface CreateAppealRequest {
  assignmentId: number;
  reason: string;
}
export interface ResolveAppealRequest {
  resolution?: string;
  newValue?: number;
}
export interface RejectAppealRequest {
  resolution?: string;
}

// ----- Transcripts -----
export interface TermGradeDto {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  termId: number;
  termName: string;
  finalPercent: number | null;
  letter: string | null;
  gpa: number | null;
  createdAt: string;
}
export interface FinalizeRequest {
  courseId: number;
  termId: number;
  studentId?: number;
}

// ----- Plagiarism -----
export interface PlagiarismReportDto {
  id: number;
  assignmentId: number;
  studentAId: number;
  studentAName: string;
  studentBId: number;
  studentBName: string;
  similarity: number;
  createdAt: string;
}
export interface SubmissionText {
  studentId: number;
  text: string;
}
export interface CheckPlagiarismRequest {
  assignmentId: number;
  submissions: SubmissionText[];
}

// ----- Peer review -----
export type PeerReviewStatus = "ASSIGNED" | "SUBMITTED";
export interface PeerReviewDto {
  id: number;
  assignmentId: number;
  assignmentName: string;
  reviewerStudentId: number;
  reviewerName: string;
  revieweeStudentId: number;
  revieweeName: string;
  status: PeerReviewStatus;
  score: number | null;
  comments: string | null;
  createdAt: string;
  submittedAt: string | null;
}
export interface AssignPeerReviewRequest {
  assignmentId: number;
  reviewerStudentId: number;
  revieweeStudentId: number;
}
export interface SubmitPeerReviewRequest {
  score?: number;
  comments?: string;
}
