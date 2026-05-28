import { api, setToken } from "./client";
import type { LoginRequest, LoginResponse, UserDto } from "@/types/api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  setToken(res.token);
  return res;
}

export function me(): Promise<UserDto> {
  return api.get<UserDto>("/auth/me");
}

export async function logout(): Promise<void> {
  try {
    await api.post<void>("/auth/logout");
  } finally {
    setToken(null);
  }
}
