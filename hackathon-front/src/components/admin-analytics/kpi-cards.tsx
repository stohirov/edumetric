"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { CountUp } from "@/components/student-dashboard/count-up";
import type { AdminKpi } from "@/types/admin-analytics";
import { cn } from "@/lib/utils";
import { aosAttributes } from "@/lib/aos";
import { pickStaggerAnimation } from "@/lib/aos-config";

function formatKpiValue(kpi: AdminKpi): { numeric: number; decimals: number; prefix: string; suffix: string } {
  switch (kpi.format) {
    case "percent":
      return { numeric: kpi.value, decimals: 1, prefix: "", suffix: "%" };
    case "currency":
      return { numeric: kpi.value / 1000, decimals: 1, prefix: "$", suffix: "K" };
    case "decimal":
      return { numeric: kpi.value, decimals: 1, prefix: "", suffix: "" };
    default:
      return { numeric: kpi.value, decimals: 0, prefix: "", suffix: "" };
  }
}

interface KpiCardsProps {
  kpis: AdminKpi[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => {
        const fmt = formatKpiValue(kpi);
        const isPositive = kpi.trend === "up";
        const isNegativeGood = kpi.id === "at-risk" && kpi.trend === "down";

        return (
          <div
            key={kpi.id}
            className="card-surface card-interactive hover-lift p-4 sm:p-5"
            {...aosAttributes({
              animation: pickStaggerAnimation(index),
              delay: index * 60,
              duration: 550,
            })}
          >
            <p className="text-label line-clamp-2">{kpi.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 text-display sm:text-[1.65rem]">
              <CountUp
                value={fmt.numeric}
                decimals={fmt.decimals}
                prefix={fmt.prefix}
                suffix={fmt.suffix}
              />
            </p>
            <div
              className={cn(
                "mt-3 flex items-center gap-1 text-xs font-semibold",
                (isPositive || isNegativeGood) && kpi.trend !== "neutral"
                  ? "text-emerald-600"
                  : kpi.trend === "down"
                    ? "text-amber-600"
                    : "text-slate-400"
              )}
            >
              {kpi.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {kpi.trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              {kpi.trend === "neutral" && <Minus className="h-3 w-3" />}
              <span className="tabular-nums">
                {kpi.change > 0 ? "+" : ""}
                {kpi.change}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
