// Mirrors com.edumetric.backend.notifications.dto

export type NotificationType = "GRADE_POSTED" | "ANNOUNCEMENT";

export type AnnouncementScope = "ALL" | "GROUP";

export interface NotificationDto {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string; // Instant (ISO-8601)
}

export interface UnreadCountDto {
  count: number;
}

export interface AnnouncementDto {
  id: number;
  authorName: string;
  scope: AnnouncementScope;
  groupId: number | null;
  groupName: string | null;
  title: string;
  body: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  scope: AnnouncementScope;
  groupId?: number | null;
}
