import { api } from "./client";
import type {
  AtRiskRulesDto,
  UpdateAtRiskRulesRequest,
} from "@/types/api/atRiskRules";

export function getAtRiskRules(): Promise<AtRiskRulesDto> {
  return api.get<AtRiskRulesDto>("/at-risk-rules");
}

export function updateAtRiskRules(
  payload: UpdateAtRiskRulesRequest,
): Promise<AtRiskRulesDto> {
  return api.patch<AtRiskRulesDto>("/at-risk-rules", payload);
}
