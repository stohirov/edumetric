import { api, setToken, setRefreshToken, getRefreshToken } from "./client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SessionDto,
  TwoFactorEnabledResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  UserDto,
  VerifyEmailRequest,
} from "@/types/api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  // On the MFA-challenge response there are no tokens yet — wait for /2fa/verify.
  if (!res.mfaRequired && res.token) {
    setToken(res.token);
    setRefreshToken(res.refreshToken);
  }
  return res;
}

/** Second login step for 2FA accounts: redeem the MFA token + a TOTP/backup code. */
export async function verifyTwoFactor(payload: TwoFactorVerifyRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/2fa/verify", payload);
  setToken(res.token);
  setRefreshToken(res.refreshToken);
  return res;
}

/** Begin 2FA enrollment: returns a pending secret + otpauth URI to render as a QR. */
export function setupTwoFactor(): Promise<TwoFactorSetupResponse> {
  return api.post<TwoFactorSetupResponse>("/auth/2fa/setup");
}

/** Confirm the first code and activate 2FA; returns one-time backup codes. */
export function enableTwoFactor(code: string): Promise<TwoFactorEnabledResponse> {
  return api.post<TwoFactorEnabledResponse>("/auth/2fa/enable", { code });
}

/** Turn 2FA off (requires a current TOTP or backup code). */
export function disableTwoFactor(code: string): Promise<void> {
  return api.post<void>("/auth/2fa/disable", { code });
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

/** Confirm ownership of an email address by consuming a verification token. */
export function verifyEmail(payload: VerifyEmailRequest): Promise<void> {
  return api.post<void>("/auth/verify-email", payload);
}

/** Request a fresh verification email. Always resolves (server never reveals account state). */
export function resendVerification(payload: ResendVerificationRequest): Promise<void> {
  return api.post<void>("/auth/resend-verification", payload);
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
