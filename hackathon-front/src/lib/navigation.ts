import type { Dictionary } from "@/lib/i18n/types";
import type { UserRole } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const SIDEBAR_WIDTH_EXPANDED = "16rem";
export const SIDEBAR_WIDTH_COLLAPSED = "4.5rem";

export function getNavForRole(role: UserRole, t: Dictionary): NavItem[] {
  return getNavSectionsForRole(role, t).flatMap((s) => s.items);
}

export function getNavSectionsForRole(role: UserRole, t: Dictionary): NavSection[] {
  switch (role) {
    case "student":
      return [
        {
          label: t.nav.sections.menu,
          items: [
            { title: t.nav.dashboard, href: "/student", icon: "LayoutDashboard" },
            { title: t.nav.myGrowth, href: "/student/growth", icon: "TrendingUp" },
            { title: t.nav.attendance, href: "/student/attendance", icon: "CalendarCheck" },
            { title: t.nav.grades, href: "/student/grades", icon: "GraduationCap" },
            { title: t.nav.homework, href: "/student/homework", icon: "ClipboardCheck" },
            { title: t.nav.content, href: "/student/content", icon: "BookOpen" },
            { title: t.nav.syllabus, href: "/student/syllabus", icon: "FileText" },
            { title: t.nav.library, href: "/student/library", icon: "Library" },
            { title: t.nav.quizzes, href: "/student/quizzes", icon: "ListChecks" },
            { title: t.nav.catalog, href: "/student/catalog", icon: "Compass" },
            { title: t.nav.certificates, href: "/student/certificates", icon: "Award" },
            { title: t.nav.notifications, href: "/student/notifications", icon: "Bell" },
            { title: t.nav.settings, href: "/student/settings", icon: "Settings" },
          ],
        },
      ];
    case "teacher":
      return [
        {
          label: t.nav.sections.menu,
          items: [
            { title: t.nav.today, href: "/teacher", icon: "CalendarDays" },
            { title: t.nav.groups, href: "/teacher/groups", icon: "Layers" },
            { title: t.nav.attendance, href: "/teacher/attendance", icon: "CalendarCheck" },
            { title: t.nav.grades, href: "/teacher/grades", icon: "ClipboardList" },
            { title: t.nav.homework, href: "/teacher/homework", icon: "ClipboardCheck" },
            { title: t.nav.content, href: "/teacher/content", icon: "BookOpen" },
            { title: t.nav.syllabus, href: "/teacher/syllabus", icon: "FileText" },
            { title: t.nav.library, href: "/teacher/library", icon: "Library" },
            { title: t.nav.quizzes, href: "/teacher/quizzes", icon: "ListChecks" },
            { title: t.nav.atRisk, href: "/teacher/at-risk", icon: "AlertTriangle", badge: "3" },
            { title: t.nav.students, href: "/teacher/students", icon: "Users" },
            { title: t.nav.announcements, href: "/teacher/announcements", icon: "Megaphone" },
            { title: t.nav.notifications, href: "/teacher/notifications", icon: "Bell" },
            { title: t.nav.settings, href: "/teacher/settings", icon: "Settings" },
          ],
        },
      ];
    case "admin":
      return [
        {
          label: t.nav.sections.main,
          items: [
            { title: t.nav.dashboard, href: "/admin", icon: "LayoutDashboard" },
            { title: t.nav.students, href: "/admin/students", icon: "Users" },
            { title: t.nav.teachers, href: "/admin/teachers", icon: "UserCog" },
            { title: t.nav.groups, href: "/admin/groups", icon: "Layers" },
            { title: "Courses", href: "/admin/courses", icon: "BookOpen" },
            { title: "Lessons", href: "/admin/lessons", icon: "CalendarClock" },
          ],
        },
        {
          label: t.nav.sections.people,
          items: [
            { title: t.nav.enrollment, href: "/admin/enrollment", icon: "UserCheck" },
            { title: t.nav.enrollmentRequests, href: "/admin/enrollment-requests", icon: "Inbox" },
            { title: t.nav.coTeachers, href: "/admin/teaching", icon: "UserCog" },
            { title: t.nav.invitations, href: "/admin/invitations", icon: "MailPlus" },
            { title: t.nav.imports, href: "/admin/imports", icon: "Upload" },
            { title: t.nav.parents, href: "/admin/parents", icon: "HeartHandshake" },
          ],
        },
        {
          label: t.nav.sections.org,
          items: [
            { title: t.nav.departments, href: "/admin/departments", icon: "Building2" },
            { title: t.nav.terms, href: "/admin/terms", icon: "CalendarRange" },
          ],
        },
        {
          label: t.nav.sections.insights,
          items: [
            { title: t.nav.analytics, href: "/analytics", icon: "BarChart3" },
            {
              title: t.nav.atRisk,
              href: "/admin/at-risk",
              icon: "AlertTriangle",
              badge: "12",
            },
          ],
        },
        {
          label: t.nav.sections.system,
          items: [
            { title: t.nav.announcements, href: "/admin/announcements", icon: "Megaphone" },
            { title: t.nav.notifications, href: "/admin/notifications", icon: "Bell" },
            { title: t.nav.settings, href: "/admin/settings", icon: "Settings" },
          ],
        },
      ];
    case "parent":
      return [
        {
          label: t.nav.sections.menu,
          items: [
            { title: t.nav.children, href: "/parent", icon: "Users" },
            { title: t.nav.notifications, href: "/parent/notifications", icon: "Bell" },
            { title: t.nav.settings, href: "/parent/settings", icon: "Settings" },
          ],
        },
      ];
    default:
      return [];
  }
}

export function getRoleLabels(t: Dictionary): Record<UserRole, string> {
  return t.nav.roles;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  const homeRoutes = ["/student", "/teacher", "/admin"];
  if (homeRoutes.includes(href)) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
