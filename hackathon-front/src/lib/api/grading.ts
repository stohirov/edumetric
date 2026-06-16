import { api } from "./client";
import type {
  AssignPeerReviewRequest,
  CheckPlagiarismRequest,
  CreateAppealRequest,
  CreateFeedbackRequest,
  CreateGradeCategoryRequest,
  FeedbackDto,
  FinalizeRequest,
  GradeAppealDto,
  GradeCategoryDto,
  PageResponse,
  PeerReviewDto,
  PlagiarismReportDto,
  RejectAppealRequest,
  ResolveAppealRequest,
  RubricDto,
  RubricScoreDto,
  ScoreRubricRequest,
  SubmitPeerReviewRequest,
  TermGradeDto,
  UpdateGradeCategoryRequest,
  UpsertRubricRequest,
} from "@/types/api";

// ----- Grade categories -----
export function listCategories(courseId: number): Promise<GradeCategoryDto[]> {
  return api
    .get<PageResponse<GradeCategoryDto>>("/grade-categories", {
      query: { courseId, size: 200 },
    })
    .then((p) => p.items);
}
export function createCategory(payload: CreateGradeCategoryRequest): Promise<GradeCategoryDto> {
  return api.post<GradeCategoryDto>("/grade-categories", payload);
}
export function updateCategory(id: number, payload: UpdateGradeCategoryRequest): Promise<GradeCategoryDto> {
  return api.patch<GradeCategoryDto>(`/grade-categories/${id}`, payload);
}
export function deleteCategory(id: number): Promise<void> {
  return api.delete<void>(`/grade-categories/${id}`);
}

// ----- Rubrics -----
export function getRubric(assignmentId: number): Promise<RubricDto> {
  return api.get<RubricDto>("/rubrics", { query: { assignmentId } });
}
export function upsertRubric(payload: UpsertRubricRequest): Promise<RubricDto> {
  return api.put<RubricDto>("/rubrics", payload);
}
export function getRubricScores(assignmentId: number, studentId: number): Promise<RubricScoreDto[]> {
  return api.get<RubricScoreDto[]>("/rubrics/scores", { query: { assignmentId, studentId } });
}
export function scoreRubric(payload: ScoreRubricRequest): Promise<unknown> {
  return api.post<unknown>("/rubrics/score", payload);
}

// ----- Feedback -----
export function postFeedback(payload: CreateFeedbackRequest): Promise<FeedbackDto> {
  return api.post<FeedbackDto>("/feedback", payload);
}
export function listFeedback(assignmentId: number, studentId: number): Promise<FeedbackDto[]> {
  return api
    .get<PageResponse<FeedbackDto>>("/feedback", {
      query: { assignmentId, studentId, size: 200 },
    })
    .then((p) => p.items);
}
export function myFeedback(assignmentId: number): Promise<FeedbackDto[]> {
  return api
    .get<PageResponse<FeedbackDto>>("/feedback/me", {
      query: { assignmentId, size: 200 },
    })
    .then((p) => p.items);
}

// ----- Grade appeals -----
export function openAppeal(payload: CreateAppealRequest): Promise<GradeAppealDto> {
  return api.post<GradeAppealDto>("/appeals", payload);
}
export function myAppeals(): Promise<GradeAppealDto[]> {
  return api
    .get<PageResponse<GradeAppealDto>>("/appeals/me", { query: { size: 200 } })
    .then((p) => p.items);
}
export function pendingAppeals(): Promise<GradeAppealDto[]> {
  return api
    .get<PageResponse<GradeAppealDto>>("/appeals", { query: { size: 200 } })
    .then((p) => p.items);
}
export function resolveAppeal(id: number, payload: ResolveAppealRequest): Promise<GradeAppealDto> {
  return api.post<GradeAppealDto>(`/appeals/${id}/resolve`, payload);
}
export function rejectAppeal(id: number, payload: RejectAppealRequest): Promise<GradeAppealDto> {
  return api.post<GradeAppealDto>(`/appeals/${id}/reject`, payload);
}

// ----- Transcripts -----
export function finalizeTermGrades(payload: FinalizeRequest): Promise<TermGradeDto[]> {
  return api.post<TermGradeDto[]>("/transcripts/finalize", payload);
}
export function studentTranscript(studentId: number): Promise<TermGradeDto[]> {
  return api.get<TermGradeDto[]>(`/transcripts/student/${studentId}`);
}
export function myTranscript(): Promise<TermGradeDto[]> {
  return api.get<TermGradeDto[]>("/transcripts/me");
}

// ----- Plagiarism -----
export function checkPlagiarism(payload: CheckPlagiarismRequest): Promise<PlagiarismReportDto[]> {
  return api.post<PlagiarismReportDto[]>("/plagiarism/check", payload);
}
export function listPlagiarism(assignmentId: number): Promise<PlagiarismReportDto[]> {
  return api
    .get<PageResponse<PlagiarismReportDto>>("/plagiarism", {
      query: { assignmentId, size: 200 },
    })
    .then((p) => p.items);
}

// ----- Peer review -----
export function assignPeerReview(payload: AssignPeerReviewRequest): Promise<PeerReviewDto> {
  return api.post<PeerReviewDto>("/peer-reviews", payload);
}
export function listPeerReviews(assignmentId: number): Promise<PeerReviewDto[]> {
  return api
    .get<PageResponse<PeerReviewDto>>("/peer-reviews", {
      query: { assignmentId, size: 200 },
    })
    .then((p) => p.items);
}
export function myPeerReviews(): Promise<PeerReviewDto[]> {
  return api
    .get<PageResponse<PeerReviewDto>>("/peer-reviews/me", {
      query: { size: 200 },
    })
    .then((p) => p.items);
}
export function submitPeerReview(id: number, payload: SubmitPeerReviewRequest): Promise<PeerReviewDto> {
  return api.post<PeerReviewDto>(`/peer-reviews/${id}/submit`, payload);
}
