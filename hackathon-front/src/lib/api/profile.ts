import { api } from "./client";
import type { UpdateProfileRequest, UserDto } from "@/types/api";

export function getProfile(): Promise<UserDto> {
  return api.get<UserDto>("/profile");
}

export function updateProfile(payload: UpdateProfileRequest): Promise<UserDto> {
  return api.patch<UserDto>("/profile", payload);
}
