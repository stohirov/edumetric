import { api } from "./client";
import type {
  AssignmentDto,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from "@/types/api";

export function listByCourse(courseId: number): Promise<AssignmentDto[]> {
  return api.get<AssignmentDto[]>("/assignments", {
    query: { courseId: String(courseId) },
  });
}

export function createAssignment(
  payload: CreateAssignmentRequest,
): Promise<AssignmentDto> {
  return api.post<AssignmentDto>("/assignments", payload);
}

export function updateAssignment(
  id: number,
  payload: UpdateAssignmentRequest,
): Promise<AssignmentDto> {
  return api.patch<AssignmentDto>(`/assignments/${id}`, payload);
}

export function deleteAssignment(id: number): Promise<void> {
  return api.delete<void>(`/assignments/${id}`);
}
