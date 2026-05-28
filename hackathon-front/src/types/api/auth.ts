// Mirrors com.edumetric.backend.auth and users.domain.Role

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: Role;
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

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}
