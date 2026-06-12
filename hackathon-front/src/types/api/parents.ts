// Mirrors com.edumetric.backend.parents DTOs

export interface ParentLinkDto {
  id: number;
  parentUserId: number;
  parentName: string;
  studentId: number;
  studentName: string;
  relationship: string | null;
}

export interface ChildSummaryDto {
  studentId: number;
  studentName: string;
  groupName: string | null;
}

export interface CreateParentLinkRequest {
  parentUserId: number;
  studentId: number;
  relationship?: string;
}
