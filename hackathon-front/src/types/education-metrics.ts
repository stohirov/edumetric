import type { LucideIcon } from "lucide-react";

export type EducationKpiId =
  | "overall-score"
  | "attendance"
  | "assignments"
  | "practical"
  | "behavior"
  | "activity"
  | "growth"
  | "at-risk";

export interface EducationKpi {
  id: EducationKpiId;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  sparkline: number[];
  iconName:
    | "Target"
    | "CalendarCheck"
    | "ClipboardList"
    | "FlaskConical"
    | "HeartHandshake"
    | "Zap"
    | "TrendingUp"
    | "AlertTriangle";
  accent: "indigo" | "emerald" | "violet" | "amber" | "rose" | "sky" | "teal" | "orange";
}

export interface ScorePillar {
  label: string;
  score: number;
  target: number;
}

export interface GroupPerformance {
  id: string;
  name: string;
  students: number;
  avgScore: number;
  attendance: number;
  trend: number;
}

export interface AtRiskStudentRow {
  id: string;
  name: string;
  group: string;
  score: number;
  attendance: number;
  riskFactors: string[];
}

export interface InsightItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: "attendance" | "grade" | "behavior" | "growth" | "alert";
}

export type KpiIconMap = Record<EducationKpi["iconName"], LucideIcon>;
