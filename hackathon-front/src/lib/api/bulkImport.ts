import { api } from "./client";
import type { BulkImportResultDto } from "@/types/api";

function upload(path: string, file: File): Promise<BulkImportResultDto> {
  const form = new FormData();
  form.append("file", file);
  return api.post<BulkImportResultDto>(path, form);
}

export function importStudents(file: File): Promise<BulkImportResultDto> {
  return upload("/admin/import/students", file);
}

export function importTeachers(file: File): Promise<BulkImportResultDto> {
  return upload("/admin/import/teachers", file);
}
