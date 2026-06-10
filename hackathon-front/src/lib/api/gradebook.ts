import { api } from "./client";
import type { GradebookDto, StudentCourseGradesDto } from "@/types/api/gradebook";

export function getGradebook(
  courseId: number,
  groupId?: number | null,
): Promise<GradebookDto> {
  const query: Record<string, string> = { courseId: String(courseId) };
  if (groupId != null) {
    query.groupId = String(groupId);
  }
  return api.get<GradebookDto>("/gradebook", { query });
}

export function getMyCourseGrades(): Promise<StudentCourseGradesDto> {
  return api.get<StudentCourseGradesDto>("/gradebook/me");
}
