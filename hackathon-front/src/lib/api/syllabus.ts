import { api } from "./client";
import type { SyllabusDto, UpsertSyllabusRequest } from "@/types/api";

export function getSyllabus(courseId: number): Promise<SyllabusDto> {
  return api.get<SyllabusDto>("/syllabus", { query: { courseId } });
}

export function upsertSyllabus(payload: UpsertSyllabusRequest): Promise<SyllabusDto> {
  return api.put<SyllabusDto>("/syllabus", payload);
}

export function getMySyllabus(): Promise<SyllabusDto> {
  return api.get<SyllabusDto>("/syllabus/me");
}
