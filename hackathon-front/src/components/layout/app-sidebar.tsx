"use client";

import { ChevronLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";

interface AppSidebarProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
}

export function AppSidebar({
  role,
  userName = "Alex Morgan",
  userEmail = "alex@edumetric.io",
}: AppSidebarProps) {
  const { collapsed, toggleCollapsed } = useSidebar();
  const t = useT();
  const { logout } = useAuth();
  const handleSignOut = () => {
    void logout();
  };
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-theme bg-theme-sidebar backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex",
        collapsed ? "w-[4.5rem]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-[4.25rem] shrink-0 items-center border-b border-theme",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Logo showText={!collapsed} className={collapsed ? "scale-90" : undefined} />
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="h-8 w-8 shrink-0 text-theme-muted hover:bg-[var(--hover-bg)] hover:text-theme"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!collapsed && role === "admin" && (
        <div
          className="mx-3 mt-3 rounded-xl border border-theme px-3 py-2.5"
          style={{ background: "var(--workspace-bg)" }}
        >
          <p className="truncate text-xs font-semibold text-theme">{t.institution.name}</p>
          <p className="text-[10px] text-theme-muted">
            {t.institution.term} · {t.common.institution}
          </p>
        </div>
      )}

      <SidebarNav role={role} />

      <div className="mt-auto border-t border-theme p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="h-9 w-9 text-theme-muted"
              aria-label="Expand sidebar"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
            <Avatar className="h-8 w-8 ring-2 ring-[var(--card)]">
              <AvatarFallback className="bg-indigo-100 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-theme-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
              title={t.common.signOut}
              aria-label={t.common.signOut}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div
              className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 ring-1 ring-[var(--border-subtle)]"
              style={{ background: "var(--workspace-bg)" }}
            >
              <Avatar className="h-9 w-9 ring-2 ring-[var(--card)]">
                <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-theme">{userName}</p>
                <p className="truncate text-xs text-theme-muted">{userEmail}</p>
              </div>
            </div>
            <Separator className="my-2.5 bg-[var(--divider)]" />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--nav-inactive)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              {t.common.signOut}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
