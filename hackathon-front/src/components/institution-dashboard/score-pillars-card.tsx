"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import type { ScorePillar } from "@/types/education-metrics";

interface ScorePillarsCardProps {
  pillars: ScorePillar[];
  overallScore?: number;
  className?: string;
}

export function ScorePillarsCard({
  pillars,
  overallScore = 87.4,
  className,
}: ScorePillarsCardProps) {
  const t = useT();
  return (
    <Card interactive className={className}>
      <CardHeader>
        <CardTitle>{t.institution.pillars.title}</CardTitle>
        <CardDescription>{t.institution.pillars.desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-100">
            <div className="text-center">
              <p className="text-3xl font-bold tracking-tight text-theme tabular-nums text-display">
                {overallScore}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.institution.pillars.overall}
              </p>
            </div>
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 128 128"
              aria-hidden
            >
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="#e0e7ff"
                strokeWidth="6"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="#6366f1"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 364} 364`}
              />
            </svg>
          </div>
        </div>

        <ul className="space-y-4">
          {pillars.map((pillar) => {
            const pct = Math.min(100, (pillar.score / pillar.target) * 100);
            const onTrack = pillar.score >= pillar.target;

            return (
              <li key={pillar.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{pillar.label}</span>
                  <span
                    className={cn(
                      "tabular-nums font-semibold",
                      onTrack ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {pillar.score}%
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
