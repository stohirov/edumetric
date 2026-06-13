// Mirrors com.edumetric.backend.messaging.dto

export interface ConversationDto {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserRole: string;
  lastMessageAt: string | null; // Instant (ISO-8601)
  unreadCount: number;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  mine: boolean;
  body: string;
  createdAt: string; // Instant (ISO-8601)
  readAt: string | null;
}

export interface ContactDto {
  id: number;
  fullName: string;
  role: string;
}

export interface StartConversationRequest {
  userId: number;
}

export interface SendMessageRequest {
  body: string;
}
