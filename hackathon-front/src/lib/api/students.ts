import { api, pageQuery } from "./client";
import type {
  CreateStudentRequest,
  PageParams,
  PageResponse,
  StudentDashboardDto,
  StudentDto,
  UpdateStudentRequest,
} from "@/types/api";

export function listStudents(
  params?: PageParams,
): Promise<PageResponse<StudentDto>> {
  return api.get<PageResponse<StudentDto>>("/students", {
    query: pageQuery(params),
  });
}

export function getMyStudent(): Promise<StudentDto> {
  return api.get<StudentDto>("/students/me");
}

export function getMyStudentDashboard(): Promise<StudentDashboardDto> {
  return api.get<StudentDashboardDto>("/students/me/dashboard");
}

export function getStudent(id: number): Promise<StudentDto> {
  return api.get<StudentDto>(`/students/${id}`);
}

export function getStudentDashboard(
  id: number,
): Promise<StudentDashboardDto> {
  return api.get<StudentDashboardDto>(`/students/${id}/dashboard`);
}

export function createStudent(
  payload: CreateStudentRequest,
): Promise<StudentDto> {
  return api.post<StudentDto>("/students", payload);
}

export function updateStudent(
  id: number,
  payload: UpdateStudentRequest,
): Promise<StudentDto> {
  return api.patch<StudentDto>(`/students/${id}`, payload);
}

export function deleteStudent(id: number): Promise<void> {
  return api.delete<void>(`/students/${id}`);
}
