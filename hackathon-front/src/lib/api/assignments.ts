import { api } from "./client";
import type {
  AssignmentDto,
  CreateAssignmentRequest,
  PageResponse,
  UpdateAssignmentRequest,
} from "@/types/api";

export function listByCourse(courseId: number): Promise<AssignmentDto[]> {
  return api
    .get<PageResponse<AssignmentDto>>("/assignments", {
      query: { courseId: String(courseId), size: 200 },
    })
    .then((p) => p.items);
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
