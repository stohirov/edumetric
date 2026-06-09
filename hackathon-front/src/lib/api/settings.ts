import { api } from "./client";
import type {
  InstitutionSettings,
  UpdateInstitutionSettingsRequest,
} from "@/types/api";

export function getSettings(): Promise<InstitutionSettings> {
  return api.get<InstitutionSettings>("/settings");
}

export function updateSettings(
  payload: UpdateInstitutionSettingsRequest,
): Promise<InstitutionSettings> {
  return api.patch<InstitutionSettings>("/settings", payload);
}
