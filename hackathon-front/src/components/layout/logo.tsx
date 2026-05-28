import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

export function Logo({ className, showText = true, variant = "light" }: LogoProps) {
  const isDark = variant === "dark";

  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-[0_2px_8px_-2px_rgb(79_70_229/0.5)] transition-all duration-300 group-hover:shadow-[0_4px_14px_-2px_rgb(79_70_229/0.55)] group-hover:scale-[1.02]">
        <GraduationCap className="h-4 w-4 text-white" strokeWidth={2.25} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "text-sm font-bold tracking-tight",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            EduMetric
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.14em]",
              isDark ? "text-slate-400" : "text-slate-400"
            )}
          >
            CRM
          </span>
        </div>
      )}
    </Link>
  );
}
