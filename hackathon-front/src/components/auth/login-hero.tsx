"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Activity, TrendingUp, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { aosAttributes } from "@/lib/aos";
import { useT } from "@/components/providers/locale-provider";

export function LoginHero() {
  const t = useT();
  const m = t.login.hero.radarMetrics;

  const radarData = [
    { metric: m.engagement, value: 88, fullMark: 100 },
    { metric: m.attendance, value: 94, fullMark: 100 },
    { metric: m.grades, value: 82, fullMark: 100 },
    { metric: m.retention, value: 91, fullMark: 100 },
    { metric: m.satisfaction, value: 86, fullMark: 100 },
  ];

  const floatingStats = [
    { label: t.login.hero.stats.activeStudents, value: "12.8K", icon: Users, delay: "0s" },
    { label: t.login.hero.stats.avgAttendance, value: "94.2%", icon: Activity, delay: "0.5s" },
    { label: t.login.hero.stats.growth, value: "+18%", icon: TrendingUp, delay: "1s" },
  ];

  return (
    <div className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden p-8 sm:p-10 lg:p-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_0%,rgba(99,102,241,0.35),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_100%,rgba(79,70,229,0.2),transparent)]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] login-grid-animate"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl login-float-slow" />
      <div className="pointer-events-none absolute -left-16 bottom-1/4 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl login-float-delayed" />

      <div className="relative z-10">
        <Logo variant="dark" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center py-8 lg:py-12">
        <div className="max-w-xl" {...aosAttributes({ animation: "fade-up", duration: 800 })}>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {t.login.hero.live}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {t.login.hero.title}{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              {t.login.hero.titleHighlight}
            </span>{" "}
            {t.login.hero.titleEnd}
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-400 sm:text-lg">{t.login.hero.subtitle}</p>
        </div>

        <div className="relative mt-10 flex items-center justify-center lg:mt-12">
          <div className="relative h-[280px] w-full max-w-md sm:h-[320px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-full w-full max-w-[300px] rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-indigo-950/50 backdrop-blur-md login-scale-in"
                {...aosAttributes({ animation: "zoom-in", delay: 200, duration: 900 })}
              >
                <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-indigo-300/80">
                  {t.login.hero.radar}
                </p>
                <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                    <PolarGrid stroke="rgba(255,255,255,0.12)" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: "rgba(199,210,254,0.9)", fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#818cf8"
                      fill="#6366f1"
                      fillOpacity={0.35}
                      strokeWidth={2}
                      isAnimationActive
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {floatingStats.map((stat, i) => {
              const Icon = stat.icon;
              const positions = [
                "left-0 top-4 sm:left-4",
                "right-0 top-1/2 -translate-y-1/2 sm:right-0",
                "bottom-4 left-8 sm:left-12",
              ];

              return (
                <div
                  key={stat.label}
                  className={cn(
                    "absolute hidden rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 shadow-lg backdrop-blur-md sm:block login-float animate-float-soft",
                    positions[i]
                  )}
                  style={{ animationDelay: stat.delay }}
                  {...aosAttributes({
                    animation: "fade-left",
                    delay: 300 + i * 120,
                    duration: 700,
                  })}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                      <Icon className="h-4 w-4 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400">{stat.label}</p>
                      <p className="text-sm font-semibold tabular-nums text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 hidden gap-3 lg:flex">
          {[65, 82, 45, 91, 78, 88].map((h, i) => (
            <div
              key={i}
              className="login-bar-pulse w-2 rounded-full bg-gradient-to-t from-indigo-600/40 to-indigo-400/80"
              style={{
                height: `${h}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      <p className="relative z-10 text-xs text-slate-500">{t.login.hero.copyright}</p>
    </div>
  );
}
