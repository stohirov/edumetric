"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { axisTick, chartGridProps, chartMargin, CHART_COLORS } from "@/lib/chart-theme";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { GroupPerformance } from "@/types/education-metrics";

interface GroupPerformanceCardProps {
  groups: GroupPerformance[];
  className?: string;
}

export function GroupPerformanceCard({ groups, className }: GroupPerformanceCardProps) {
  const t = useT();
  const chartData = groups.map((g) => ({
    name: g.name.length > 14 ? `${g.name.slice(0, 12)}…` : g.name,
    value: g.avgScore,
    fullName: g.name,
  }));

  return (
    <Card interactive className={className}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{t.institution.groups.title}</CardTitle>
          <CardDescription>{t.institution.groups.desc}</CardDescription>
        </div>
        <Link
          href="/admin/groups"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {t.common.viewAll}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="min-w-0">
        <ResponsiveContainer
          width="100%"
          height={220}
          minWidth={0}
          minHeight={220}
        >
          <BarChart data={chartData} margin={{ ...chartMargin, bottom: 8 }} barSize={28}>
            <CartesianGrid {...chartGridProps} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={axisTick}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} width={32} domain={[70, 100]} />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value) => `${value}%`}
                />
              }
            />
            <Bar dataKey="value" name={t.institution.kpis.overallScore} radius={[6, 6, 0, 0]} animationDuration={900}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_COLORS.indigoScale[i % CHART_COLORS.indigoScale.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100/80 bg-slate-50/50">
          {groups.slice(0, 4).map((group) => (
            <li
              key={group.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{group.name}</p>
                <p className="text-xs text-slate-500">
                  {group.students} {t.common.students} · {group.attendance}% {t.institution.groups.attendance}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs font-semibold tabular-nums",
                  group.trend >= 0 ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {group.trend >= 0 ? "+" : ""}
                {group.trend}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
