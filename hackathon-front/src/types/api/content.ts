// @/types/api/content — mirrors com.edumetric.backend.content.dto.*

export type MaterialType = "PAGE" | "FILE" | "LINK" | "VIDEO";

/** A learning material in the authoring (teacher/admin) view. */
export interface MaterialDto {
  id: number;
  moduleId: number;
  title: string;
  type: MaterialType;
  content: string | null;
  url: string | null;
  hasFile: boolean;
  fileName: string | null;
  fileSize: number | null;
  contentType: string | null;
  position: number;
  published: boolean;
}

/** A course module with its ordered materials (authoring view). */
export interface ModuleDto {
  id: number;
  courseId: number;
  courseName: string;
  title: string;
  summary: string | null;
  position: number;
  published: boolean;
  materials: MaterialDto[];
}

export interface CreateModuleRequest {
  courseId: number;
  title: string;
  summary?: string | null;
  position?: number;
  published?: boolean;
}

export interface UpdateModuleRequest {
  title?: string;
  summary?: string | null;
  position?: number;
  published?: boolean;
}

export interface CreateMaterialRequest {
  title: string;
  type: MaterialType;
  content?: string | null;
  url?: string | null;
  position?: number;
  published?: boolean;
}

export interface UpdateMaterialRequest {
  title?: string;
  type?: MaterialType;
  content?: string | null;
  url?: string | null;
  position?: number;
  published?: boolean;
}

// ----- Student consumption -----

export interface StudentMaterialDto {
  id: number;
  title: string;
  type: MaterialType;
  content: string | null;
  url: string | null;
  hasFile: boolean;
  fileName: string | null;
  fileSize: number | null;
  contentType: string | null;
  position: number;
  completed: boolean;
}

export interface StudentModuleDto {
  id: number;
  title: string;
  summary: string | null;
  position: number;
  materials: StudentMaterialDto[];
}

export interface CourseContentDto {
  courseId: number | null;
  courseName: string | null;
  totalMaterials: number;
  completedMaterials: number;
  modules: StudentModuleDto[];
}
