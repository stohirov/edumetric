import { api } from "./client";
import type { CertificateDto, CertificateVerificationDto } from "@/types/api";

export function claimCertificate(): Promise<CertificateDto> {
  return api.post<CertificateDto>("/certificates/claim");
}

export function myCertificates(): Promise<CertificateDto[]> {
  return api.get<CertificateDto[]>("/certificates/me");
}

// Public — no auth required.
export function verifyCertificate(code: string): Promise<CertificateVerificationDto> {
  return api.get<CertificateVerificationDto>(`/certificates/verify/${code}`);
}
