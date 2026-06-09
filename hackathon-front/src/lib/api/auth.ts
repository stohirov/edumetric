import { api, setToken, setRefreshToken, getRefreshToken } from "./client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  SessionDto,
  UserDto,
} from "@/types/api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  setToken(res.token);
  setRefreshToken(res.refreshToken);
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

/** List the current user's active sessions (most recently used first). */
export function listSessions(): Promise<SessionDto[]> {
  return api.get<SessionDto[]>("/auth/sessions");
}

/** Revoke a single session by id. Revoking the current session signs this device out. */
export function revokeSession(id: number): Promise<void> {
  return api.delete<void>(`/auth/sessions/${id}`);
}

/** Revoke every session except the current one ("log out everywhere else"). */
export function revokeOtherSessions(): Promise<{ revoked: number }> {
  const refreshToken = getRefreshToken();
  return api.post<{ revoked: number }>(
    "/auth/sessions/revoke-others",
    refreshToken ? { refreshToken } : undefined,
  );
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    // Send the refresh token so the server can revoke it (defends against reuse).
    await api.post<void>("/auth/logout", refreshToken ? { refreshToken } : undefined);
  } finally {
    setToken(null);
    setRefreshToken(null);
  }
}
