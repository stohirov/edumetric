import { api, API_BASE_URL, ApiError, getToken } from "./client";
import type {
  CourseContentDto,
  CreateMaterialRequest,
  CreateModuleRequest,
  MaterialDto,
  MaterialVersionDto,
  ModuleDto,
  UpdateMaterialRequest,
  UpdateModuleRequest,
} from "@/types/api/content";

// ----- Teacher / admin authoring -----

/** All modules (with materials) for a course the caller teaches. */
export function listModules(courseId: number): Promise<ModuleDto[]> {
  return api.get<ModuleDto[]>("/modules", { query: { courseId: String(courseId) } });
}

export function createModule(payload: CreateModuleRequest): Promise<ModuleDto> {
  return api.post<ModuleDto>("/modules", payload);
}

export function updateModule(
  id: number,
  payload: UpdateModuleRequest,
): Promise<ModuleDto> {
  return api.patch<ModuleDto>(`/modules/${id}`, payload);
}

export function deleteModule(id: number): Promise<void> {
  return api.delete<void>(`/modules/${id}`);
}

export function createMaterial(
  moduleId: number,
  payload: CreateMaterialRequest,
): Promise<MaterialDto> {
  return api.post<MaterialDto>(`/modules/${moduleId}/materials`, payload);
}

export function updateMaterial(
  id: number,
  payload: UpdateMaterialRequest,
): Promise<MaterialDto> {
  return api.patch<MaterialDto>(`/materials/${id}`, payload);
}

export function deleteMaterial(id: number): Promise<void> {
  return api.delete<void>(`/materials/${id}`);
}

/** Version history of a material (newest first). */
export function listMaterialVersions(id: number): Promise<MaterialVersionDto[]> {
  return api.get<MaterialVersionDto[]>(`/materials/${id}/versions`);
}

/** Roll a material back to a prior version (the current state is snapshotted first). */
export function restoreMaterialVersion(
  id: number,
  versionId: number,
): Promise<MaterialDto> {
  return api.post<MaterialDto>(`/materials/${id}/versions/${versionId}/restore`);
}

/** Upload (or replace) the file backing a FILE material (multipart). */
export function uploadMaterialFile(id: number, file: File): Promise<MaterialDto> {
  const form = new FormData();
  form.append("file", file);
  return api.post<MaterialDto>(`/materials/${id}/file`, form);
}

/** Teacher download of a material file as a Blob. */
export function downloadMaterialFile(id: number): Promise<Blob> {
  return fetchFileBlob(`/materials/${id}/file`);
}

// ----- Student consumption -----

/** The current student's course curriculum with completion state. */
export function getMyContent(): Promise<CourseContentDto> {
  return api.get<CourseContentDto>("/content/me");
}

export function markComplete(materialId: number): Promise<void> {
  return api.post<void>(`/content/materials/${materialId}/complete`);
}

export function unmarkComplete(materialId: number): Promise<void> {
  return api.delete<void>(`/content/materials/${materialId}/complete`);
}

/** Student download of a published material file as a Blob. */
export function downloadStudentMaterialFile(materialId: number): Promise<Blob> {
  return fetchFileBlob(`/content/materials/${materialId}/file`);
}

async function fetchFileBlob(path: string): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiError("Failed to download file", response.status);
  }
  return response.blob();
}
