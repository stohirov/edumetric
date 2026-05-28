import { api, pageQuery } from "./client";
import type {
  CourseDto,
  CreateCourseRequest,
  PageParams,
  PageResponse,
  UpdateCourseRequest,
} from "@/types/api";

export function listCourses(
  params?: PageParams,
): Promise<PageResponse<CourseDto>> {
  return api.get<PageResponse<CourseDto>>("/courses", {
    query: pageQuery(params),
  });
}

export function getCourse(id: number): Promise<CourseDto> {
  return api.get<CourseDto>(`/courses/${id}`);
}

export function createCourse(
  payload: CreateCourseRequest,
): Promise<CourseDto> {
  return api.post<CourseDto>("/courses", payload);
}

export function updateCourse(
  id: number,
  payload: UpdateCourseRequest,
): Promise<CourseDto> {
  return api.patch<CourseDto>(`/courses/${id}`, payload);
}

export function deleteCourse(id: number): Promise<void> {
  return api.delete<void>(`/courses/${id}`);
}
