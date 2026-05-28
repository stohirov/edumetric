// Mirrors com.edumetric.backend.groups.dto

export interface GroupDto {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  startDate: string; // LocalDate
  endDate: string;
}

export interface CreateGroupRequest {
  name: string;
  courseId: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  courseId?: number;
  startDate?: string;
  endDate?: string;
}
