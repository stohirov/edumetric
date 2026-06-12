import { api } from "./client";
import type {
  AcademicTermDto,
  CreateAcademicTermRequest,
  CreateDepartmentRequest,
  DepartmentDto,
  UpdateAcademicTermRequest,
  UpdateDepartmentRequest,
} from "@/types/api";

export function listDepartments(): Promise<DepartmentDto[]> {
  return api.get<DepartmentDto[]>("/departments");
}

export function createDepartment(
  payload: CreateDepartmentRequest,
): Promise<DepartmentDto> {
  return api.post<DepartmentDto>("/departments", payload);
}

export function updateDepartment(
  id: number,
  payload: UpdateDepartmentRequest,
): Promise<DepartmentDto> {
  return api.patch<DepartmentDto>(`/departments/${id}`, payload);
}

export function deleteDepartment(id: number): Promise<void> {
  return api.delete<void>(`/departments/${id}`);
}

export function listTerms(): Promise<AcademicTermDto[]> {
  return api.get<AcademicTermDto[]>("/academic-terms");
}

export function createTerm(
  payload: CreateAcademicTermRequest,
): Promise<AcademicTermDto> {
  return api.post<AcademicTermDto>("/academic-terms", payload);
}

export function updateTerm(
  id: number,
  payload: UpdateAcademicTermRequest,
): Promise<AcademicTermDto> {
  return api.patch<AcademicTermDto>(`/academic-terms/${id}`, payload);
}

export function deleteTerm(id: number): Promise<void> {
  return api.delete<void>(`/academic-terms/${id}`);
}
