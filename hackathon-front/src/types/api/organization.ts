// Mirrors com.edumetric.backend.organization DTOs

export interface DepartmentDto {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
}

export interface AcademicTermDto {
  id: number;
  name: string;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string;
  current: boolean;
}

export interface CreateAcademicTermRequest {
  name: string;
  startDate: string;
  endDate: string;
  current?: boolean;
}

export interface UpdateAcademicTermRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
}
