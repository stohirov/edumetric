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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreDistributionBucket } from "@/types/admin-analytics";
import { cn } from "@/lib/utils";

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

interface ScoreDistributionChartProps {
  data: ScoreDistributionBucket[];
  className?: string;
}

export function ScoreDistributionChart({ data, className }: ScoreDistributionChartProps) {
  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Score distribution</CardTitle>
        <CardDescription>Institution-wide grade breakdown by letter</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="grade"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as ScoreDistributionBucket;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-sm">
                    <p className="font-semibold text-slate-900">Grade {row.grade}</p>
                    <p className="tabular-nums text-indigo-600">
                      {row.count.toLocaleString()} students ({row.percentage}%)
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56} isAnimationActive animationDuration={1000}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
