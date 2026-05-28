"use client";

import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "./count-up";
import type { StudentAnalyticsProfile } from "@/types/student-analytics";
import { cn } from "@/lib/utils";

interface StudentHeroProps {
  profile: StudentAnalyticsProfile;
  className?: string;
}

export function StudentHero({ profile, className }: StudentHeroProps) {
  const isPositiveGrowth = profile.growthPercent >= 0;

  return (
    <section
      className={cn(
        "card-hero card-interactive relative overflow-hidden p-6 sm:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-violet-100/40 blur-2xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 shrink-0 ring-4 ring-indigo-50 shadow-md sm:h-24 sm:w-24">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-semibold text-white sm:text-2xl">
              {profile.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1 border-0 bg-indigo-600 px-2.5 py-0.5 text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
                {profile.percentileRank}
              </Badge>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {profile.semester}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {profile.fullName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{profile.group}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Composite score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              <CountUp value={profile.compositeScore} decimals={1} />
            </span>
            <span className="text-2xl font-medium text-slate-400">/100</span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isPositiveGrowth
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {isPositiveGrowth ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4 rotate-180" />
            )}
            <CountUp
              value={Math.abs(profile.growthPercent)}
              decimals={1}
              prefix={isPositiveGrowth ? "+" : "-"}
              suffix="%"
            />
            <span className="font-normal opacity-80">vs last month</span>
          </div>
        </div>
      </div>
    </section>
  );
}
