"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import {
  axisTick,
  chartGradientId,
  chartGridProps,
  chartMargin,
  CHART_COLORS,
} from "@/lib/chart-theme";
import { useT } from "@/components/providers/locale-provider";
import type { ChartDataPoint } from "@/types";

interface GrowthTrendCardProps {
  data: ChartDataPoint[];
  className?: string;
}

export function GrowthTrendCard({ data, className }: GrowthTrendCardProps) {
  const t = useT();
  const gradScore = chartGradientId("growth-score");
  const gradAtt = chartGradientId("growth-att");

  return (
    <Card interactive className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>{t.institution.growthChart.title}</CardTitle>
          <CardDescription>{t.institution.growthChart.desc}</CardDescription>
        </div>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-900">
          {t.institution.growthChart.ytd}
        </span>
      </CardHeader>
      <CardContent className="min-w-0">
        <ResponsiveContainer
          width="100%"
          height={300}
          minWidth={0}
          minHeight={300}
        >
          <AreaChart data={data} margin={chartMargin}>
            <defs>
              <linearGradient id={gradScore} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={gradAtt} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.2} />
                <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGridProps} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} width={32} domain={[75, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="top"
              height={28}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={t.institution.growthChart.overall}
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              fill={`url(#${gradScore})`}
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              name={t.institution.growthChart.attendance}
              stroke={CHART_COLORS.success}
              strokeWidth={2}
              fill={`url(#${gradAtt})`}
              animationDuration={1100}
            />
            <Area
              type="monotone"
              dataKey="assignments"
              name={t.institution.growthChart.assignments}
              stroke={CHART_COLORS.primaryLight}
              strokeWidth={2}
              fill="transparent"
              strokeDasharray="4 4"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
