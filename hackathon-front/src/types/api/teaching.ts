// Mirrors com.edumetric.backend.teaching DTOs

export type AssignmentRole = "LEAD" | "CO_TEACHER";

export interface CourseTeacherDto {
  id: number;
  courseId: number;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  assignmentRole: AssignmentRole;
  createdAt: string;
}

export interface AssignTeacherRequest {
  courseId: number;
  teacherId: number;
  role?: AssignmentRole;
}
