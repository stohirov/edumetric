// Mirrors com.edumetric.backend.invitations DTOs

import type { Role } from "./auth";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface InvitationDto {
  id: number;
  email: string;
  fullName: string | null;
  role: Role;
  groupId: number | null;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  // Raw token — only present on the create response, used to build the invite link.
  token: string | null;
}

export interface InvitationPreviewDto {
  email: string;
  fullName: string | null;
  role: Role;
}

export interface CreateInvitationRequest {
  email: string;
  fullName?: string;
  role: Role;
  groupId?: number;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  fullName?: string;
}
