// Mirrors com.edumetric.backend.auth and users.domain.Role

export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export type AccountStatus = "ACTIVE" | "SUSPENDED";

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  language: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
  // True for provisioned accounts that must set a new password before using the app.
  mustChangePassword: boolean;
  // True when the account has TOTP two-factor authentication enabled.
  twoFactorEnabled: boolean;
  // True once the owner has confirmed ownership of their email address.
  emailVerified: boolean;
  // Optional self-service contact info.
  phone: string | null;
  address: string | null;
  // Relative API path (under the /api base) to fetch the avatar image, or null when unset.
  avatarUrl: string | null;
  // Account lifecycle state — SUSPENDED accounts are retained but cannot log in.
  status: AccountStatus;
  emergencyContact: string | null;
  departmentId: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  // Null on the MFA-challenge response; populated once login completes.
  token: string | null;
  expiresInSeconds: number;
  // Opaque, rotating refresh token used by the client for silent re-auth.
  refreshToken: string | null;
  user: UserDto | null;
  // True when the account has 2FA on — complete login via /auth/2fa/verify.
  mfaRequired: boolean;
  // Short-lived token redeemed at the verify step (only set when mfaRequired).
  mfaToken: string | null;
}

// Mirrors com.edumetric.backend.auth.dto.TwoFactorVerifyRequest
export interface TwoFactorVerifyRequest {
  mfaToken: string;
  code: string;
}

// Mirrors com.edumetric.backend.auth.dto.TwoFactorSetupResponse
export interface TwoFactorSetupResponse {
  secret: string;
  otpauthUri: string;
}

// Mirrors com.edumetric.backend.auth.dto.TwoFactorEnabledResponse
export interface TwoFactorEnabledResponse {
  backupCodes: string[];
}

// Mirrors com.edumetric.backend.auth.dto.SessionDto — one active refresh-token session.
export interface SessionDto {
  id: number;
  // True for the session making the request.
  current: boolean;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
}

// Mirrors com.edumetric.backend.auth.dto.ForgotPasswordRequest
export interface ForgotPasswordRequest {
  email: string;
}

// Mirrors com.edumetric.backend.auth.dto.ResetPasswordRequest
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Mirrors com.edumetric.backend.auth.dto.VerifyEmailRequest
export interface VerifyEmailRequest {
  token: string;
}

// Mirrors com.edumetric.backend.auth.dto.ResendVerificationRequest
export interface ResendVerificationRequest {
  email: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

// Mirrors com.edumetric.backend.users.dto.UpdateUserRequest — all fields optional.
export interface UpdateUserRequest {
  email?: string;
  password?: string;
  fullName?: string;
  role?: Role;
  emergencyContact?: string;
  // 0 clears the department assignment.
  departmentId?: number;
}

// Mirrors com.edumetric.backend.users.dto.UpdateProfileRequest — self-service,
// cannot change role. All fields optional.
export interface UpdateProfileRequest {
  email?: string;
  password?: string;
  fullName?: string;
  language?: string;
  notifyEmail?: boolean;
  notifyInApp?: boolean;
  // Sent as an empty string to clear the stored value.
  phone?: string;
  address?: string;
}
