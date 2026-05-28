"use client";

import {
  AlertCircle,
  BookOpen,
  HeartHandshake,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { InsightItem } from "@/types/education-metrics";

const insightIcons = {
  attendance: UserCheck,
  grade: BookOpen,
  behavior: HeartHandshake,
  growth: TrendingUp,
  alert: AlertCircle,
};

const insightColors = {
  attendance: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  grade: "bg-violet-50 text-violet-600 ring-violet-100",
  behavior: "bg-teal-50 text-teal-600 ring-teal-100",
  growth: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  alert: "bg-rose-50 text-rose-600 ring-rose-100",
};

interface InstitutionInsightsCardProps {
  insights: InsightItem[];
  className?: string;
}

export function InstitutionInsightsCard({ insights, className }: InstitutionInsightsCardProps) {
  const t = useT();
  return (
    <Card interactive className={className}>
      <CardHeader>
        <CardTitle>{t.institution.insights.title}</CardTitle>
        <CardDescription>{t.institution.insights.desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {insights.map((item) => {
          const Icon = insightIcons[item.type];

          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50/80"
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                  insightColors[item.type]
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-theme">{item.title}</p>
                  <span className="shrink-0 text-[10px] font-medium text-slate-400">
                    {item.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
