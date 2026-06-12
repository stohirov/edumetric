import { api, pageQuery } from "./client";
import type {
  CreateUserRequest,
  PageParams,
  PageResponse,
  Role,
  UpdateUserRequest,
  UserDto,
} from "@/types/api";

export function listUsers(
  params?: PageParams & { role?: Role },
): Promise<PageResponse<UserDto>> {
  const q = { ...(pageQuery(params) || {}), role: params?.role };
  return api.get<PageResponse<UserDto>>("/users", { query: q });
}

export function createUser(payload: CreateUserRequest): Promise<UserDto> {
  return api.post<UserDto>("/users", payload);
}

export function updateUser(
  id: number,
  payload: UpdateUserRequest,
): Promise<UserDto> {
  return api.patch<UserDto>(`/users/${id}`, payload);
}

export function suspendUser(id: number): Promise<UserDto> {
  return api.post<UserDto>(`/users/${id}/suspend`);
}

export function reactivateUser(id: number): Promise<UserDto> {
  return api.post<UserDto>(`/users/${id}/reactivate`);
}

export function deleteUser(id: number): Promise<void> {
  return api.delete<void>(`/users/${id}`);
}
