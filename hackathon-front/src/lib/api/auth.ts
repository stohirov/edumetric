import { api, setToken } from "./client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  UserDto,
} from "@/types/api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  setToken(res.token);
  return res;
}

export function me(): Promise<UserDto> {
  return api.get<UserDto>("/auth/me");
}

/** Request a password-reset token. Always resolves (server never reveals if the email exists). */
export function forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  return api.post<void>("/auth/forgot-password", payload);
}

/** Consume a reset token and set a new password. */
export function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  return api.post<void>("/auth/reset-password", payload);
}

export async function logout(): Promise<void> {
  try {
    await api.post<void>("/auth/logout");
  } finally {
    setToken(null);
  }
}
