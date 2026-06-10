// @/types/api/quizzes — mirrors com.edumetric.backend.quizzes.dto.*

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

// ----- Authoring (teacher/admin) -----

export interface OptionDto {
  id: number;
  text: string;
  correct: boolean;
  position: number;
}

export interface QuestionDto {
  id: number;
  text: string;
  type: QuestionType;
  points: number;
  position: number;
  options: OptionDto[];
}

export interface QuizDto {
  id: number;
  courseId: number;
  courseName: string;
  moduleId: number | null;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  passScore: number | null;
  shuffleQuestions: boolean;
  published: boolean;
  questionCount: number;
  totalPoints: number;
}

export interface QuizDetailDto {
  id: number;
  courseId: number;
  courseName: string;
  moduleId: number | null;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  passScore: number | null;
  shuffleQuestions: boolean;
  published: boolean;
  questions: QuestionDto[];
}

export interface CreateQuizRequest {
  courseId: number;
  moduleId?: number | null;
  title: string;
  description?: string | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  passScore?: number | null;
  shuffleQuestions?: boolean;
  published?: boolean;
}

export interface UpdateQuizRequest {
  moduleId?: number | null;
  title?: string;
  description?: string | null;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  passScore?: number | null;
  shuffleQuestions?: boolean;
  published?: boolean;
}

export interface OptionRequest {
  text: string;
  correct: boolean;
}

export interface QuestionRequest {
  text: string;
  type: QuestionType;
  points?: number | null;
  options: OptionRequest[];
}

export interface ReplaceQuestionsRequest {
  questions: QuestionRequest[];
}

// ----- Student taking -----

export interface StudentQuizDto {
  id: number;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  passScore: number | null;
  questionCount: number;
  totalPoints: number;
  attemptsUsed: number;
  bestScore: number | null;
  lastPassed: boolean | null;
}

export interface TakeOptionDto {
  id: number;
  text: string;
}

export interface TakeQuestionDto {
  id: number;
  text: string;
  type: QuestionType;
  points: number;
  options: TakeOptionDto[];
}

export interface TakeQuizDto {
  id: number;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  attemptsUsed: number;
  questions: TakeQuestionDto[];
}

export interface AnswerSubmission {
  questionId: number;
  selectedOptionIds?: number[] | null;
  textAnswer?: string | null;
}

export interface SubmitAttemptRequest {
  answers: AnswerSubmission[];
}

export interface QuestionResultDto {
  questionId: number;
  awardedPoints: number;
  maxPoints: number;
  correct: boolean;
}

export interface AttemptResultDto {
  attemptId: number;
  quizId: number;
  score: number;
  maxScore: number;
  passed: boolean | null;
  submittedAt: string;
  results: QuestionResultDto[];
}
