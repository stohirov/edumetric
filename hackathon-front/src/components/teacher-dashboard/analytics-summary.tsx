import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { TeacherAnalyticsSummary } from "@/types/teacher-dashboard";
import { cn } from "@/lib/utils";

interface AnalyticsSummaryProps {
  items: TeacherAnalyticsSummary[];
}

export function AnalyticsSummary({ items }: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="card-surface card-interactive px-4 py-3.5 sm:px-5"
        >
          <p className="text-xs font-medium text-slate-500">{item.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
            {item.value}
          </p>
          {item.change && (
            <p
              className={cn(
                "mt-1 flex items-center gap-0.5 text-xs font-medium",
                item.trend === "up" && "text-emerald-600",
                item.trend === "down" && "text-amber-600",
                item.trend === "neutral" && "text-slate-400"
              )}
            >
              {item.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {item.trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              {item.trend === "neutral" && <Minus className="h-3 w-3" />}
              {item.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
