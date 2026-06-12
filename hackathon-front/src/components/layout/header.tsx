"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Header({ title, description, action, className }: HeaderProps) {
  const t = useT();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-theme bg-theme-header backdrop-blur-xl backdrop-saturate-150",
        className
      )}
    >
      <div className="flex h-[4.25rem] items-center justify-between gap-4 px-6 sm:px-8">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-theme text-display sm:text-xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-[13px] text-theme-muted">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted" />
            <Input placeholder={t.common.search} className="h-9 w-56 pl-9" />
          </div>
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle />
          <NotificationBell />
          {action}
        </div>
      </div>
    </header>
  );
}
