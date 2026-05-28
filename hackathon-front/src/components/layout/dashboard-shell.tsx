"use client";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { AppSidebar } from "./app-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { SidebarProvider, useSidebar } from "./sidebar-provider";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
  userEmail?: string;
}

function DashboardMain({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "min-h-screen transition-[padding-left] duration-300 ease-out",
        "pt-14 lg:pt-0",
        collapsed ? "lg:pl-[4.5rem]" : "lg:pl-64"
      )}
    >
      <div className="app-canvas">{children}</div>
    </main>
  );
}

export function DashboardShell({
  children,
  role,
  userName,
  userEmail,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} userName={userName} userEmail={userEmail} />
      <MobileSidebar role={role} userName={userName} userEmail={userEmail} />
      <DashboardTopbar />
      <DashboardMain>{children}</DashboardMain>
    </SidebarProvider>
  );
}
