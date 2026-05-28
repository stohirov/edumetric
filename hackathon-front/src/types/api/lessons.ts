// Mirrors com.edumetric.backend.lessons.dto

export interface LessonDto {
  id: number;
  groupId: number;
  groupName: string;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  topic: string;
  scheduledAt: string; // OffsetDateTime ISO
}

export interface CreateLessonRequest {
  groupId: number;
  courseId: number;
  teacherId: number;
  topic: string;
  scheduledAt: string;
}

export interface UpdateLessonRequest {
  groupId?: number;
  courseId?: number;
  teacherId?: number;
  topic?: string;
  scheduledAt?: string;
}
