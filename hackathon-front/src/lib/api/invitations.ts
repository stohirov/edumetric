import { api } from "./client";
import type {
  AcceptInvitationRequest,
  CreateInvitationRequest,
  InvitationDto,
  InvitationPreviewDto,
  PageResponse,
} from "@/types/api";

export function listInvitations(): Promise<InvitationDto[]> {
  return api
    .get<PageResponse<InvitationDto>>("/invitations", { query: { size: 200 } })
    .then((p) => p.items);
}

export function createInvitation(
  payload: CreateInvitationRequest,
): Promise<InvitationDto> {
  return api.post<InvitationDto>("/invitations", payload);
}

export function revokeInvitation(id: number): Promise<InvitationDto> {
  return api.post<InvitationDto>(`/invitations/${id}/revoke`);
}

// Public — no auth required.
export function previewInvitation(token: string): Promise<InvitationPreviewDto> {
  return api.get<InvitationPreviewDto>(`/invitations/preview/${token}`);
}

// Public — no auth required.
export function acceptInvitation(
  payload: AcceptInvitationRequest,
): Promise<void> {
  return api.post<void>("/invitations/accept", payload);
}
