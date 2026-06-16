import { api } from "./client";
import type { PageResponse } from "@/types/api";
import type {
  AnnouncementDto,
  CreateAnnouncementRequest,
  NotificationDto,
  UnreadCountDto,
} from "@/types/api/notifications";

// ----- Notification center -----

export function listNotifications(): Promise<NotificationDto[]> {
  return api.get<NotificationDto[]>("/notifications");
}

export function getUnreadCount(): Promise<UnreadCountDto> {
  return api.get<UnreadCountDto>("/notifications/unread-count");
}

export function markRead(id: number): Promise<void> {
  return api.post<void>(`/notifications/${id}/read`);
}

export function markAllRead(): Promise<void> {
  return api.post<void>("/notifications/read-all");
}

// ----- Announcements -----

export function listAnnouncements(): Promise<AnnouncementDto[]> {
  return api
    .get<PageResponse<AnnouncementDto>>("/announcements", { query: { size: 200 } })
    .then((p) => p.items);
}

export function createAnnouncement(
  payload: CreateAnnouncementRequest,
): Promise<AnnouncementDto> {
  return api.post<AnnouncementDto>("/announcements", payload);
}
