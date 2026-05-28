"use client";

import { LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getRoleLabels } from "@/lib/navigation";
import { useT } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import type { UserRole } from "@/types";

interface MobileSidebarProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
}

export function MobileSidebar({
  role,
  userName = "Alex Morgan",
  userEmail = "alex@edumetric.io",
}: MobileSidebarProps) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const t = useT();
  const { logout } = useAuth();
  const roleLabels = getRoleLabels(t);
  const handleSignOut = () => {
    setMobileOpen(false);
    void logout();
  };
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className="flex h-full w-[min(100vw,18rem)] flex-col border-theme bg-theme-sidebar p-0 sm:max-w-xs [&>button]:hidden"
      >
        <SheetHeader className="border-b border-theme px-5 py-4 text-left">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Logo />
          <p className="text-xs font-medium text-theme-muted">
            {roleLabels[role]} workspace
          </p>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto py-2">
          <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} />
        </div>

        <div className="mt-auto border-t border-theme p-4">
          <div className="flex items-center gap-3 rounded-lg px-1 py-1">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-theme">{userName}</p>
              <p className="truncate text-xs text-theme-muted">{userEmail}</p>
            </div>
          </div>
          <Separator className="my-3 bg-[var(--divider)]" />
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--nav-inactive)] transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            {t.common.signOut}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
