"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttendanceAnalyticsPoint } from "@/types/admin-analytics";
import { cn } from "@/lib/utils";

interface AttendanceAnalyticsChartProps {
  data: AttendanceAnalyticsPoint[];
  className?: string;
}

export function AttendanceAnalyticsChart({ data, className }: AttendanceAnalyticsChartProps) {
  const hasData = data.length > 0;
  const avgRate = hasData
    ? data.reduce((a, b) => a + b.rate, 0) / data.length
    : 0;

  // Fit the Y-axis to the actual range so real-world rates aren't clipped.
  const rates = data.map((d) => d.rate);
  const minRate = hasData ? Math.max(0, Math.floor(Math.min(...rates) - 5)) : 0;
  const maxRate = hasData ? Math.min(100, Math.ceil(Math.max(...rates) + 5)) : 100;

  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Attendance analytics</CardTitle>
        <CardDescription>Weekly attendance rate and volume trends</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {!hasData ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-500">No attendance recorded yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Weekly trends appear once attendance is marked.
            </p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={280}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceRateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <YAxis
              yAxisId="rate"
              domain={[minRate, maxRate]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const rate = payload.find((p) => p.dataKey === "rate")?.value;
                const present = payload.find((p) => p.dataKey === "present")?.value;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-lg text-sm">
                    <p className="font-medium text-slate-500">{label}</p>
                    <p className="mt-1 font-semibold tabular-nums text-emerald-600">
                      Rate: {typeof rate === "number" ? rate.toFixed(1) : rate}%
                    </p>
                    <p className="tabular-nums text-slate-600">
                      Present: {typeof present === "number" ? present.toLocaleString() : present}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              yAxisId="rate"
              type="monotone"
              dataKey="rate"
              stroke="transparent"
              fill="url(#attendanceRateGrad)"
              isAnimationActive
              animationDuration={1200}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="rate"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1200}
            />
          </ComposedChart>
        </ResponsiveContainer>
        )}
        {hasData ? (
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 rounded bg-emerald-500" />
              Attendance rate %
            </span>
            <span className="tabular-nums text-slate-400">
              Avg. {avgRate.toFixed(1)}% this period
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
