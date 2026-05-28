import { api } from "./client";
import type {
  BulkGradeRequest,
  CreateGradeRequest,
  GradeDto,
  UpdateGradeRequest,
} from "@/types/api";

export function createGrade(payload: CreateGradeRequest): Promise<GradeDto> {
  return api.post<GradeDto>("/grades", payload);
}

export function bulkCreateGrades(payload: BulkGradeRequest): Promise<number> {
  return api.post<number>("/grades/bulk", payload);
}

export function updateGrade(
  id: number,
  payload: UpdateGradeRequest,
): Promise<GradeDto> {
  return api.patch<GradeDto>(`/grades/${id}`, payload);
}

export function deleteGrade(id: number): Promise<void> {
  return api.delete<void>(`/grades/${id}`);
}
