import { api } from "./client";
import type {
  EnrollmentDto,
  EnrollRequest,
  TransferRequest,
  WithdrawRequest,
} from "@/types/api";

export function enroll(payload: EnrollRequest): Promise<EnrollmentDto> {
  return api.post<EnrollmentDto>("/enrollments/enroll", payload);
}

export function transfer(payload: TransferRequest): Promise<EnrollmentDto> {
  return api.post<EnrollmentDto>("/enrollments/transfer", payload);
}

export function withdraw(payload: WithdrawRequest): Promise<EnrollmentDto> {
  return api.post<EnrollmentDto>("/enrollments/withdraw", payload);
}

export function history(studentId: number): Promise<EnrollmentDto[]> {
  return api.get<EnrollmentDto[]>(`/enrollments/student/${studentId}`);
}
