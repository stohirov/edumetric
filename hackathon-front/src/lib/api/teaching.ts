import { api } from "./client";
import type { AssignTeacherRequest, CourseTeacherDto } from "@/types/api";

export function listCourseTeachers(courseId: number): Promise<CourseTeacherDto[]> {
  return api.get<CourseTeacherDto[]>("/course-teachers", {
    query: { courseId },
  });
}

export function assignTeacher(
  payload: AssignTeacherRequest,
): Promise<CourseTeacherDto> {
  return api.post<CourseTeacherDto>("/course-teachers", payload);
}

export function unassignTeacher(
  courseId: number,
  teacherId: number,
): Promise<void> {
  return api.delete<void>("/course-teachers", {
    query: { courseId, teacherId },
  });
}
