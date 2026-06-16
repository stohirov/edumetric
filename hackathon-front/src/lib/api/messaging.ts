import { api } from "./client";
import type { PageResponse } from "@/types/api";
import type {
  ContactDto,
  ConversationDto,
  MessageDto,
} from "@/types/api/messaging";

export function listConversations(): Promise<ConversationDto[]> {
  return api
    .get<PageResponse<ConversationDto>>("/messages/conversations", {
      query: { size: 200 },
    })
    .then((p) => p.items);
}

export function startConversation(userId: number): Promise<ConversationDto> {
  return api.post<ConversationDto>("/messages/conversations", { userId });
}

export function getMessages(id: number): Promise<MessageDto[]> {
  return api
    .get<PageResponse<MessageDto>>(`/messages/conversations/${id}`, {
      query: { size: 200 },
    })
    .then((p) => p.items);
}

export function sendMessage(id: number, body: string): Promise<MessageDto> {
  return api.post<MessageDto>(`/messages/conversations/${id}`, { body });
}

export function listContacts(): Promise<ContactDto[]> {
  return api.get<ContactDto[]>("/messages/contacts");
}
