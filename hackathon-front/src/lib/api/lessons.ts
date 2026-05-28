import { api, pageQuery } from "./client";
import type {
  AttendanceDto,
  CreateLessonRequest,
  LessonDto,
  PageParams,
  PageResponse,
  UpdateLessonRequest,
} from "@/types/api";

export function listLessons(
  params?: PageParams,
): Promise<PageResponse<LessonDto>> {
  return api.get<PageResponse<LessonDto>>("/lessons", {
    query: pageQuery(params),
  });
}

export function getTodayLessons(): Promise<LessonDto[]> {
  return api.get<LessonDto[]>("/lessons/today");
}

export function getLesson(id: number): Promise<LessonDto> {
  return api.get<LessonDto>(`/lessons/${id}`);
}

export function getLessonAttendance(id: number): Promise<AttendanceDto[]> {
  return api.get<AttendanceDto[]>(`/lessons/${id}/attendance`);
}

export function createLesson(payload: CreateLessonRequest): Promise<LessonDto> {
  return api.post<LessonDto>("/lessons", payload);
}

export function updateLesson(
  id: number,
  payload: UpdateLessonRequest,
): Promise<LessonDto> {
  return api.patch<LessonDto>(`/lessons/${id}`, payload);
}

export function deleteLesson(id: number): Promise<void> {
  return api.delete<void>(`/lessons/${id}`);
}
