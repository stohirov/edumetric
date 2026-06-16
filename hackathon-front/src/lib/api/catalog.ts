import { api } from "./client";
import type {
  CatalogItemDto,
  CreateEnrollmentRequestRequest,
  EnrollmentRequestDto,
  PageResponse,
} from "@/types/api";

export function listCatalog(): Promise<CatalogItemDto[]> {
  return api
    .get<PageResponse<CatalogItemDto>>("/catalog", { query: { size: 200 } })
    .then((p) => p.items);
}

export function requestEnrollment(
  payload: CreateEnrollmentRequestRequest,
): Promise<EnrollmentRequestDto> {
  return api.post<EnrollmentRequestDto>("/catalog/requests", payload);
}

export function myRequests(): Promise<EnrollmentRequestDto[]> {
  return api
    .get<PageResponse<EnrollmentRequestDto>>("/catalog/requests/me", {
      query: { size: 200 },
    })
    .then((p) => p.items);
}

export function pendingRequests(): Promise<EnrollmentRequestDto[]> {
  return api
    .get<PageResponse<EnrollmentRequestDto>>("/catalog/requests", {
      query: { size: 200 },
    })
    .then((p) => p.items);
}

export function approveRequest(id: number): Promise<EnrollmentRequestDto> {
  return api.post<EnrollmentRequestDto>(`/catalog/requests/${id}/approve`);
}

export function rejectRequest(id: number): Promise<EnrollmentRequestDto> {
  return api.post<EnrollmentRequestDto>(`/catalog/requests/${id}/reject`);
}
