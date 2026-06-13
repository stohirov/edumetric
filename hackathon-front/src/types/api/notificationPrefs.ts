// Mirrors com.edumetric.backend.notifications.dto

export type NotificationEventType =
  | "GRADE_POSTED"
  | "ANNOUNCEMENT"
  | "ABSENCE_MARKED"
  | "MESSAGE_RECEIVED"
  | "REMINDER";

export interface NotificationPreferenceDto {
  eventType: NotificationEventType;
  inApp: boolean;
  email: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  eventType: NotificationEventType;
  inApp: boolean;
  email: boolean;
}
