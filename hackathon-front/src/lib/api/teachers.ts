import { api, pageQuery } from "./client";
import type {
  CreateTeacherRequest,
  GroupDto,
  PageParams,
  PageResponse,
  StudentDto,
  TeacherDto,
  UpdateTeacherRequest,
} from "@/types/api";

export function listTeachers(
  params?: PageParams,
): Promise<PageResponse<TeacherDto>> {
  return api.get<PageResponse<TeacherDto>>("/teachers", {
    query: pageQuery(params),
  });
}

export function getMyTeacher(): Promise<TeacherDto> {
  return api.get<TeacherDto>("/teachers/me");
}

export function listMyStudents(
  params?: PageParams,
): Promise<PageResponse<StudentDto>> {
  return api.get<PageResponse<StudentDto>>("/teachers/me/students", {
    query: pageQuery(params),
  });
}

export function listMyGroups(): Promise<GroupDto[]> {
  return api.get<GroupDto[]>("/teachers/me/groups");
}

export function getTeacher(id: number): Promise<TeacherDto> {
  return api.get<TeacherDto>(`/teachers/${id}`);
}

export function createTeacher(
  payload: CreateTeacherRequest,
): Promise<TeacherDto> {
  return api.post<TeacherDto>("/teachers", payload);
}

export function updateTeacher(
  id: number,
  payload: UpdateTeacherRequest,
): Promise<TeacherDto> {
  return api.patch<TeacherDto>(`/teachers/${id}`, payload);
}

export function deleteTeacher(id: number): Promise<void> {
  return api.delete<void>(`/teachers/${id}`);
}
