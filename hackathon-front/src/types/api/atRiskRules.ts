// Mirrors com.edumetric.backend.atrisk.dto

export interface AtRiskRulesDto {
  compositeThreshold: number;
  attendanceThreshold: number;
  flagLowConfidence: boolean;
  compositeEnabled: boolean;
  attendanceEnabled: boolean;
  updatedAt: string; // Instant ISO
}

export interface UpdateAtRiskRulesRequest {
  compositeThreshold?: number;
  attendanceThreshold?: number;
  flagLowConfidence?: boolean;
  compositeEnabled?: boolean;
  attendanceEnabled?: boolean;
}
