// Mirrors com.edumetric.backend.teachers.dto

export interface TeacherDto {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  department: string;
}

export interface CreateTeacherRequest {
  email: string;
  password: string;
  fullName: string;
  department?: string;
}

export interface UpdateTeacherRequest {
  fullName?: string;
  department?: string;
}
