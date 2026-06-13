import { api } from "./client";
import type { SubmissionDto } from "@/types/api/submissions";

/** The signed-in student's unified submission history (homework + quizzes). */
export function getMySubmissions(): Promise<SubmissionDto[]> {
  return api.get<SubmissionDto[]>("/submissions/me");
}

/** Every submission in a course, for a teacher who owns it (or an admin). */
export function getCourseSubmissions(courseId: number): Promise<SubmissionDto[]> {
  return api.get<SubmissionDto[]>("/submissions", {
    query: { courseId: String(courseId) },
  });
}
