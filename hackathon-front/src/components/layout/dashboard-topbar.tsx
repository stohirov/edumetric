"use client";

import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useSidebar } from "./sidebar-provider";

export function DashboardTopbar() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-theme bg-theme-header px-4 backdrop-blur-xl lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-theme-muted" />
      </Button>
      <Logo showText />
      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
