// Mirrors com.edumetric.backend.courses.dto

export interface CourseDto {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  description?: string;
}
