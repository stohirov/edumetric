"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "./chart-tooltip";
import { CHART_COLORS } from "@/lib/chart-theme";
import type { ChartDataPoint } from "@/types";

interface DonutChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  height?: number;
}

export function DonutChartCard({
  title,
  description,
  data,
  height = 280,
}: DonutChartCardProps) {
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="88%"
              paddingAngle={3}
              dataKey="value"
              isAnimationActive
              animationDuration={1000}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={CHART_COLORS.indigoScale[index % CHART_COLORS.indigoScale.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={payload?.map((p) => ({
                    name: String(p.name ?? ""),
                    value: Number(p.value),
                    color: p.color,
                    dataKey: String(p.dataKey ?? ""),
                  }))}
                  formatter={(v) => `${v}%`}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm"
                style={{
                  backgroundColor:
                    CHART_COLORS.indigoScale[index % CHART_COLORS.indigoScale.length],
                }}
              />
              <span className="text-slate-600">{item.name}</span>
              <span className="font-semibold tabular-nums text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
