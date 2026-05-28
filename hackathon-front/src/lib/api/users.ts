import { api, pageQuery } from "./client";
import type {
  CreateUserRequest,
  PageParams,
  PageResponse,
  Role,
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
