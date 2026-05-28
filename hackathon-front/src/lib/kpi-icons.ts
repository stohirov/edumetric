import {
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  HeartHandshake,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { EducationKpi } from "@/types/education-metrics";

export const kpiIconMap: Record<EducationKpi["iconName"], LucideIcon> = {
  Target,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  HeartHandshake,
  Zap,
  TrendingUp,
  AlertTriangle,
};

export const kpiAccentStyles: Record<
  EducationKpi["accent"],
  { icon: string; spark: string; badge: string }
> = {
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    spark: "#6366f1",
    badge: "bg-indigo-50 text-indigo-700",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    spark: "#10b981",
    badge: "bg-emerald-50 text-emerald-700",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    spark: "#8b5cf6",
    badge: "bg-violet-50 text-violet-700",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600 ring-sky-100",
    spark: "#0ea5e9",
    badge: "bg-sky-50 text-sky-700",
  },
  teal: {
    icon: "bg-teal-50 text-teal-600 ring-teal-100",
    spark: "#14b8a6",
    badge: "bg-teal-50 text-teal-700",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    spark: "#f59e0b",
    badge: "bg-amber-50 text-amber-700",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 ring-rose-100",
    spark: "#f43f5e",
    badge: "bg-rose-50 text-rose-700",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600 ring-orange-100",
    spark: "#f97316",
    badge: "bg-orange-50 text-orange-700",
  },
};
