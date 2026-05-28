import { api, pageQuery } from "./client";
import type {
  CreateGroupRequest,
  GroupDto,
  PageParams,
  PageResponse,
  StudentDto,
  UpdateGroupRequest,
} from "@/types/api";

export function listGroups(
  params?: PageParams,
): Promise<PageResponse<GroupDto>> {
  return api.get<PageResponse<GroupDto>>("/groups", {
    query: pageQuery(params),
  });
}

export function getGroup(id: number): Promise<GroupDto> {
  return api.get<GroupDto>(`/groups/${id}`);
}

export function listGroupStudents(
  id: number,
  params?: PageParams,
): Promise<PageResponse<StudentDto>> {
  return api.get<PageResponse<StudentDto>>(`/groups/${id}/students`, {
    query: pageQuery(params),
  });
}

export function createGroup(payload: CreateGroupRequest): Promise<GroupDto> {
  return api.post<GroupDto>("/groups", payload);
}

export function updateGroup(
  id: number,
  payload: UpdateGroupRequest,
): Promise<GroupDto> {
  return api.patch<GroupDto>(`/groups/${id}`, payload);
}

export function deleteGroup(id: number): Promise<void> {
  return api.delete<void>(`/groups/${id}`);
}
