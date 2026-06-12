// Mirrors com.edumetric.backend.syllabus DTOs

export interface SyllabusDto {
  id: number | null;
  courseId: number;
  courseName: string;
  objectives: string | null;
  outline: string | null;
  published: boolean;
}

export interface UpsertSyllabusRequest {
  courseId: number;
  objectives?: string | null;
  outline?: string | null;
  published?: boolean;
}
