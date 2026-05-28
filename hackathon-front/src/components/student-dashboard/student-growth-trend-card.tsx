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
import type { GrowthTrendPoint } from "@/types/student-analytics";
import { cn } from "@/lib/utils";

interface StudentGrowthTrendCardProps {
  data: GrowthTrendPoint[];
  className?: string;
}

export function StudentGrowthTrendCard({ data, className }: StudentGrowthTrendCardProps) {
  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Growth trend</CardTitle>
        <CardDescription>
          Composite score progression over the semester
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="studentScoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const score = payload.find((p) => p.dataKey === "score")?.value;
                const group = payload.find((p) => p.dataKey === "groupAvg")?.value;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-lg">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-indigo-600">
                      You: {typeof score === "number" ? score.toFixed(1) : score}
                    </p>
                    <p className="text-sm tabular-nums text-slate-500">
                      Group: {typeof group === "number" ? group.toFixed(1) : group}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="transparent"
              fill="url(#studentScoreGradient)"
              isAnimationActive
              animationDuration={1400}
            />
            <Line
              type="monotone"
              dataKey="groupAvg"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive
              animationDuration={1200}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ fill: "#4f46e5", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1400}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 rounded bg-indigo-600" />
            Your score
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" />
            Group average
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
