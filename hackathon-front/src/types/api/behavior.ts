// Mirrors com.edumetric.backend.behavior.dto

export interface BehaviorRecordRequest {
  studentId: number;
  periodStart: string; // LocalDate
  periodEnd: string;
  value: number; // 1-5
  comment?: string;
}

export interface BulkBehaviorRequest {
  entries: BehaviorRecordRequest[];
}
