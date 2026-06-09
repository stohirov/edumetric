// Mirrors com.edumetric.backend.auth and users.domain.Role

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  language: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresInSeconds: number;
  user: UserDto;
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
}
