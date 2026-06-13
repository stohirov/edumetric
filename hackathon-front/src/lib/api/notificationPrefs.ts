import { api } from "./client";
import type {
  NotificationPreferenceDto,
  UpdateNotificationPreferenceRequest,
} from "@/types/api/notificationPrefs";

export function listNotificationPreferences(): Promise<NotificationPreferenceDto[]> {
  return api.get<NotificationPreferenceDto[]>("/notification-preferences");
}

export function updateNotificationPreference(
  payload: UpdateNotificationPreferenceRequest,
): Promise<NotificationPreferenceDto> {
  return api.put<NotificationPreferenceDto>("/notification-preferences", payload);
}
