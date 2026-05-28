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
import { ChartTooltip } from "./chart-tooltip";
import {
  axisTick,
  axisTickBold,
  chartGridProps,
  chartMargin,
  CHART_COLORS,
} from "@/lib/chart-theme";
import type { ChartDataPoint } from "@/types";

interface BarChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
}

export function BarChartCard({
  title,
  description,
  data,
  dataKey = "value",
  color = CHART_COLORS.primary,
  height = 280,
}: BarChartCardProps) {
  return (
    <Card interactive>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="min-w-0">
        <ResponsiveContainer
          width="100%"
          height={height}
          minWidth={0}
          minHeight={height}
        >
          <BarChart data={data} margin={chartMargin}>
            <CartesianGrid {...chartGridProps} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTickBold} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} width={36} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(238 242 255 / 0.5)", radius: 8 }} />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
