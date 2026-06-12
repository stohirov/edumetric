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
  prerequisiteModuleId: number | null;
  materials: MaterialDto[];
}

export interface CreateModuleRequest {
  courseId: number;
  title: string;
  summary?: string | null;
  position?: number;
  published?: boolean;
  prerequisiteModuleId?: number;
}

export interface UpdateModuleRequest {
  title?: string;
  summary?: string | null;
  position?: number;
  published?: boolean;
  // 0 clears the prerequisite.
  prerequisiteModuleId?: number;
}

/** A historical snapshot of a material's editable fields. */
export interface MaterialVersionDto {
  id: number;
  materialId: number;
  versionNo: number;
  title: string | null;
  type: MaterialType | null;
  content: string | null;
  url: string | null;
  createdAt: string;
  createdByUserId: number | null;
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
  // True when a prerequisite module is not yet fully completed — materials are gated.
  locked: boolean;
  prerequisiteModuleId: number | null;
  materials: StudentMaterialDto[];
}

export interface CourseContentDto {
  courseId: number | null;
  courseName: string | null;
  totalMaterials: number;
  completedMaterials: number;
  modules: StudentModuleDto[];
}
