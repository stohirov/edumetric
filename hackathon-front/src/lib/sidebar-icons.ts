import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ListChecks,
  Settings,
  TrendingUp,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export const sidebarIconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  GraduationCap,
  Settings,
  CalendarDays,
  Layers,
  ClipboardList,
  ClipboardCheck,
  AlertTriangle,
  Users,
  UserCog,
  BarChart3,
  BookOpen,
  CalendarClock,
  ListChecks,
};

export function getSidebarIcon(name: string): LucideIcon {
  return sidebarIconMap[name] ?? LayoutDashboard;
}
