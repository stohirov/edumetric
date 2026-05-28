"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { aosAttributes } from "@/lib/aos";
import { kpiAccentStyles, kpiIconMap } from "@/lib/kpi-icons";
import { pickStaggerAnimation } from "@/lib/aos-config";
import { cn } from "@/lib/utils";
import type { EducationKpi } from "@/types/education-metrics";

interface EducationKpiGridProps {
  kpis: EducationKpi[];
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((value, i) => ({ i, value }));
  const gradId = `spark-${color.replace("#", "")}`;

  return (
    <div className="h-10 w-[72px] shrink-0 opacity-90">
      <ResponsiveContainer width="100%" height="100%" minWidth={72} minHeight={40}>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EducationKpiGrid({ kpis }: EducationKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpiIconMap[kpi.iconName];
        const accent = kpiAccentStyles[kpi.accent];
        const isAtRisk = kpi.id === "at-risk";
        const positive = isAtRisk ? kpi.trend === "down" : kpi.trend === "up";
        const negative = isAtRisk ? kpi.trend === "up" : kpi.trend === "down";

        return (
          <div
            key={kpi.id}
            className="saas-metric-card group"
            {...aosAttributes({
              animation: pickStaggerAnimation(index),
              delay: index * 50,
              duration: 550,
            })}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                  accent.icon
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <MiniSparkline data={kpi.sparkline} color={accent.spark} />
            </div>

            <p className="mt-4 text-label">{kpi.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-theme tabular-nums text-display sm:text-[1.75rem]">
              {kpi.value}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                  positive && "bg-emerald-50 text-emerald-700",
                  negative && "bg-amber-50 text-amber-700",
                  kpi.trend === "neutral" && "bg-slate-100 text-slate-600"
                )}
              >
                {kpi.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                {kpi.trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                {kpi.trend === "neutral" && <Minus className="h-3 w-3" />}
                {kpi.change > 0 ? "+" : ""}
                {kpi.change}%
              </span>
              <span className="text-[11px] text-theme-muted">{kpi.changeLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
