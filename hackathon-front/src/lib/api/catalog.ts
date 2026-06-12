import { api } from "./client";
import type {
  CatalogItemDto,
  CreateEnrollmentRequestRequest,
  EnrollmentRequestDto,
} from "@/types/api";

export function listCatalog(): Promise<CatalogItemDto[]> {
  return api.get<CatalogItemDto[]>("/catalog");
}

export function requestEnrollment(
  payload: CreateEnrollmentRequestRequest,
): Promise<EnrollmentRequestDto> {
  return api.post<EnrollmentRequestDto>("/catalog/requests", payload);
}

export function myRequests(): Promise<EnrollmentRequestDto[]> {
  return api.get<EnrollmentRequestDto[]>("/catalog/requests/me");
}

export function pendingRequests(): Promise<EnrollmentRequestDto[]> {
  return api.get<EnrollmentRequestDto[]>("/catalog/requests");
}

export function approveRequest(id: number): Promise<EnrollmentRequestDto> {
  return api.post<EnrollmentRequestDto>(`/catalog/requests/${id}/approve`);
}

export function rejectRequest(id: number): Promise<EnrollmentRequestDto> {
  return api.post<EnrollmentRequestDto>(`/catalog/requests/${id}/reject`);
}
