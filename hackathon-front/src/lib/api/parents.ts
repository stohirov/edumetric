import { api } from "./client";
import type {
  ChildSummaryDto,
  CreateParentLinkRequest,
  ParentLinkDto,
  StudentDashboardDto,
} from "@/types/api";

export function listLinksByParent(parentUserId: number): Promise<ParentLinkDto[]> {
  return api.get<ParentLinkDto[]>("/parent-links", { query: { parentUserId } });
}

export function listLinksByStudent(studentId: number): Promise<ParentLinkDto[]> {
  return api.get<ParentLinkDto[]>("/parent-links", { query: { studentId } });
}

export function createLink(
  payload: CreateParentLinkRequest,
): Promise<ParentLinkDto> {
  return api.post<ParentLinkDto>("/parent-links", payload);
}

export function deleteLink(id: number): Promise<void> {
  return api.delete<void>(`/parent-links/${id}`);
}

// Parent self-service.
export function myChildren(): Promise<ChildSummaryDto[]> {
  return api.get<ChildSummaryDto[]>("/parents/me/children");
}

export function childDashboard(studentId: number): Promise<StudentDashboardDto> {
  return api.get<StudentDashboardDto>(
    `/parents/me/children/${studentId}/dashboard`,
  );
}
