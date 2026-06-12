// Mirrors com.edumetric.backend.bulkimport DTOs

export interface BulkImportRowError {
  row: number;
  email: string;
  message: string;
}

export interface BulkImportResultDto {
  total: number;
  created: number;
  failed: number;
  errors: BulkImportRowError[];
}
