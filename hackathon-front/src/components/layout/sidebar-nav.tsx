"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavSectionsForRole, isNavItemActive } from "@/lib/navigation";
import { getSidebarIcon } from "@/lib/sidebar-icons";
import { useT } from "@/components/providers/locale-provider";
import type { UserRole } from "@/types";
import { useSidebar } from "./sidebar-provider";

interface SidebarNavProps {
  role: UserRole;
  onNavigate?: () => void;
}

export function SidebarNav({ role, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const t = useT();
  const sections = getNavSectionsForRole(role, t);

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          {!collapsed && <p className="text-label mb-2 px-3">{section.label}</p>}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = getSidebarIcon(item.icon);
              const isActive = isNavItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-200 ease-out",
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                      isActive
                        ? "bg-indigo-600 text-white shadow-[0_2px_8px_-2px_rgb(79_70_229/0.5)]"
                        : "text-[var(--nav-inactive)] hover:bg-[var(--nav-hover-bg)] hover:text-theme"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                        isActive ? "text-white" : "text-[var(--foreground-muted)] group-hover:text-theme"
                      )}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[var(--card)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
