import { api } from "./client";
import type { PageResponse } from "@/types/api";
import type { SubmissionDto } from "@/types/api/submissions";

/** The signed-in student's unified submission history (homework + quizzes). */
export function getMySubmissions(): Promise<SubmissionDto[]> {
  return api
    .get<PageResponse<SubmissionDto>>("/submissions/me", {
      query: { size: 200 },
    })
    .then((p) => p.items);
}

/** Every submission in a course, for a teacher who owns it (or an admin). */
export function getCourseSubmissions(courseId: number): Promise<SubmissionDto[]> {
  return api
    .get<PageResponse<SubmissionDto>>("/submissions", {
      query: { courseId: String(courseId), size: 200 },
    })
    .then((p) => p.items);
}
