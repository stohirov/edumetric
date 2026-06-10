import { api } from "./client";
import type {
  AttemptResultDto,
  CreateQuizRequest,
  QuizDetailDto,
  QuizDto,
  ReplaceQuestionsRequest,
  StudentQuizDto,
  SubmitAttemptRequest,
  TakeQuizDto,
  UpdateQuizRequest,
} from "@/types/api/quizzes";

// ----- Teacher / admin authoring -----

export function listByCourse(courseId: number): Promise<QuizDto[]> {
  return api.get<QuizDto[]>("/quizzes", { query: { courseId: String(courseId) } });
}

export function getQuiz(id: number): Promise<QuizDetailDto> {
  return api.get<QuizDetailDto>(`/quizzes/${id}`);
}

export function createQuiz(payload: CreateQuizRequest): Promise<QuizDto> {
  return api.post<QuizDto>("/quizzes", payload);
}

export function updateQuiz(
  id: number,
  payload: UpdateQuizRequest,
): Promise<QuizDto> {
  return api.patch<QuizDto>(`/quizzes/${id}`, payload);
}

export function deleteQuiz(id: number): Promise<void> {
  return api.delete<void>(`/quizzes/${id}`);
}

export function replaceQuestions(
  id: number,
  payload: ReplaceQuestionsRequest,
): Promise<QuizDetailDto> {
  return api.put<QuizDetailDto>(`/quizzes/${id}/questions`, payload);
}

// ----- Student taking -----

export function getMyQuizzes(): Promise<StudentQuizDto[]> {
  return api.get<StudentQuizDto[]>("/quizzes/me");
}

export function getQuizToTake(id: number): Promise<TakeQuizDto> {
  return api.get<TakeQuizDto>(`/quizzes/${id}/take`);
}

export function submitAttempt(
  id: number,
  payload: SubmitAttemptRequest,
): Promise<AttemptResultDto> {
  return api.post<AttemptResultDto>(`/quizzes/${id}/attempts`, payload);
}
