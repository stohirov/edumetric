import { api, API_BASE_URL, ApiError, getToken } from "./client";
import type { UpdateProfileRequest, UserDto } from "@/types/api";

export function getProfile(): Promise<UserDto> {
  return api.get<UserDto>("/profile");
}

export function updateProfile(payload: UpdateProfileRequest): Promise<UserDto> {
  return api.patch<UserDto>("/profile", payload);
}

/** Uploads (or replaces) the current user's avatar image (multipart). */
export function uploadAvatar(file: File): Promise<UserDto> {
  const form = new FormData();
  form.append("file", file);
  return api.post<UserDto>("/profile/avatar", form);
}

/** Clears the current user's avatar. */
export function deleteAvatar(): Promise<UserDto> {
  return api.delete<UserDto>("/profile/avatar");
}

/** Fetches the current user's avatar image as a Blob (for inline preview). */
export async function getAvatar(): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiError("Failed to load avatar", response.status);
  }
  return response.blob();
}
