// Mirrors com.edumetric.backend.library DTOs

export interface LibraryItemDto {
  materialId: number;
  title: string;
  courseId: number;
  courseName: string;
  moduleTitle: string;
  fileName: string | null;
  fileSize: number | null;
  contentType: string | null;
}
