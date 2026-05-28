"use client";

import { chartTooltipStyle } from "@/lib/chart-theme";

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value?: number; name?: string; color?: string; dataKey?: string }[];
  label?: string;
  formatter?: (value: number, name: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div style={chartTooltipStyle} className="outline-none">
      {label && (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => {
          const val = entry.value ?? 0;
          const display = formatter
            ? formatter(val, String(entry.name ?? entry.dataKey ?? ""))
            : val.toLocaleString();

          return (
            <div key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? "#4f46e5" }}
              />
              <span className="text-slate-600">{entry.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-slate-900">
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
