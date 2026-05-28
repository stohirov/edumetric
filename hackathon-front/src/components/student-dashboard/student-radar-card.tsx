"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RadarDimensionData } from "@/types/student-analytics";
import { cn } from "@/lib/utils";

interface StudentRadarCardProps {
  data: RadarDimensionData[];
  className?: string;
}

export function StudentRadarCard({ data, className }: StudentRadarCardProps) {
  return (
    <Card interactive className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Performance radar</CardTitle>
        <CardDescription>
          Your scores across five dimensions vs group average
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as RadarDimensionData;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
                    <p className="font-semibold text-slate-900">{row.dimension}</p>
                    <p className="mt-1 text-indigo-600">
                      You: <span className="tabular-nums font-medium">{row.student}</span>
                    </p>
                    <p className="text-slate-500">
                      Group: <span className="tabular-nums font-medium">{row.group}</span>
                    </p>
                  </div>
                );
              }}
            />
            <Radar
              name="Group avg"
              dataKey="group"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.12}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              isAnimationActive
              animationDuration={1000}
            />
            <Radar
              name="You"
              dataKey="student"
              stroke="#4f46e5"
              fill="#6366f1"
              fillOpacity={0.35}
              strokeWidth={2}
              isAnimationActive
              animationDuration={1200}
              animationEasing="ease-out"
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) => (
                <span className="text-slate-600">{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
