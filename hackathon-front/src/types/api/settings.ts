// Mirrors com.edumetric.backend.settings — institution-wide configuration.

export type GradingScale = "PERCENT" | "LETTER" | "GPA_4";

export interface InstitutionSettings {
  institutionName: string;
  defaultLocale: string;
  primaryColor: string | null;
  logoUrl: string | null;
  gradingScale: GradingScale;
  atRiskThreshold: number;
}

// Mirrors UpdateInstitutionSettingsRequest — all fields optional.
export interface UpdateInstitutionSettingsRequest {
  institutionName?: string;
  defaultLocale?: string;
  primaryColor?: string;
  logoUrl?: string;
  gradingScale?: GradingScale;
  atRiskThreshold?: number;
}
