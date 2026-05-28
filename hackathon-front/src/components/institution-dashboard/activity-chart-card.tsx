"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { axisTick, chartGridProps, chartMargin, CHART_COLORS } from "@/lib/chart-theme";
import { useT } from "@/components/providers/locale-provider";
import type { ChartDataPoint } from "@/types";

interface ActivityChartCardProps {
  data: ChartDataPoint[];
  className?: string;
}

export function ActivityChartCard({ data, className }: ActivityChartCardProps) {
  const t = useT();
  return (
    <Card interactive className={className}>
      <CardHeader>
        <CardTitle>{t.institution.activity.title}</CardTitle>
        <CardDescription>{t.institution.activity.desc}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ResponsiveContainer
          width="100%"
          height={200}
          minWidth={0}
          minHeight={200}
        >
          <BarChart data={data} margin={chartMargin} barSize={22}>
            <CartesianGrid {...chartGridProps} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} width={28} />
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
            <Bar
              dataKey="value"
              name={t.institution.activity.engagement}
              fill={CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
