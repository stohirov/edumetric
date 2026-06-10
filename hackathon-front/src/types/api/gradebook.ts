// Mirrors com.edumetric.backend.gradebook.dto

import type { AssignmentType } from "./grades";
import type { GradingScale } from "./settings";

export interface GradebookColumnDto {
  assignmentId: number;
  name: string;
  type: AssignmentType;
  maxValue: number;
  weight: number;
  dueDate: string | null;
  gradedCount: number;
  missingCount: number;
  averagePercent: number | null;
}

export interface GradebookCellDto {
  assignmentId: number;
  gradeId: number | null;
  value: number | null;
  percent: number | null;
  submitted: boolean;
  comment: string | null;
}

export interface GradebookRowDto {
  studentId: number;
  studentName: string;
  groupId: number;
  groupName: string;
  cells: GradebookCellDto[];
  gradedCount: number;
  coursePercent: number | null;
  display: string | null;
}

export interface GradebookDto {
  courseId: number;
  courseName: string;
  gradingScale: GradingScale;
  columns: GradebookColumnDto[];
  rows: GradebookRowDto[];
}

export interface StudentCourseGradeItem {
  assignmentId: number;
  name: string;
  type: AssignmentType;
  value: number | null;
  maxValue: number;
  weight: number;
  percent: number | null;
  graded: boolean;
  submitted: boolean;
  dueDate: string | null;
  gradedAt: string | null;
  comment: string | null;
}

export interface StudentCourseGradesDto {
  courseId: number | null;
  courseName: string | null;
  gradingScale: GradingScale;
  coursePercent: number | null;
  display: string | null;
  items: StudentCourseGradeItem[];
}
