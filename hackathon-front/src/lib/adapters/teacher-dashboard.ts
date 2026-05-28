// Composes the teacher dashboard from several backend endpoints.

import type {
  AtRiskStudentDto,
  GroupDto,
  LessonDto,
  TeacherDto,
} from "@/types/api";
import type {
  AtRiskStudent,
  LessonStatus,
  PendingTask,
  TeacherAnalyticsSummary,
  TeacherDashboardData,
  TeacherGroup,
  TeacherProfile,
  TodayLesson,
} from "@/types/teacher-dashboard";

function timeStr(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

function classifyLessonStatus(scheduledAt: string): LessonStatus {
  try {
    const start = new Date(scheduledAt).getTime();
    if (Number.isNaN(start)) return "upcoming";
    const now = Date.now();
    const liveWindowMs = 90 * 60 * 1000; // 90 minutes
    if (now < start) return "upcoming";
    if (now - start < liveWindowMs) return "live";
    return "completed";
  } catch {
    return "upcoming";
  }
}

export interface TeacherDashboardSources {
  teacher: TeacherDto | null;
  fallbackProfile: { fullName: string; email: string };
  lessons: LessonDto[];
  atRisk: AtRiskStudentDto[];
  groups: GroupDto[];
}

export function adaptTeacherDashboard(
  src: TeacherDashboardSources,
): TeacherDashboardData {
  const profile: TeacherProfile = {
    fullName: src.teacher?.fullName ?? src.fallbackProfile.fullName,
    email: src.teacher?.email ?? src.fallbackProfile.email,
    department: src.teacher?.department ?? "—",
  };

  const lessonsToday: TodayLesson[] = src.lessons.map((lesson) => {
    const status = classifyLessonStatus(lesson.scheduledAt);
    const start = timeStr(lesson.scheduledAt);
    // No duration in backend — assume 90 minute slot.
    const endDate = new Date(lesson.scheduledAt);
    if (!Number.isNaN(endDate.getTime())) {
      endDate.setMinutes(endDate.getMinutes() + 90);
    }
    return {
      id: String(lesson.id),
      title: lesson.topic || lesson.courseName,
      group: lesson.groupName,
      startTime: start,
      endTime: timeStr(endDate.toISOString()),
      room: "—",
      students: 0,
      status,
      attendanceMarked: status === "completed",
    };
  });

  const atRiskStudents: AtRiskStudent[] = src.atRisk.map((s) => ({
    id: String(s.studentId),
    name: s.fullName,
    email: s.email,
    course: s.groupName,
    attendance: Math.round(Number(s.attendanceNorm)),
    gpa: Math.round(Number(s.compositeScore) * 100) / 100,
    reason: s.reason,
  }));

  const teacherGroups: TeacherGroup[] = src.groups.map((g) => ({
    id: String(g.id),
    name: g.name,
    code: g.courseName,
    students: 0, // backend doesn't return on GroupDto; fetch per-group if needed
    attendanceRate: 0,
    avgScore: 0,
    atRiskCount: atRiskStudents.filter(
      (s) => s.course === g.name,
    ).length,
    nextLesson: undefined,
  }));

  const pendingTasks: PendingTask[] = lessonsToday
    .filter((l) => l.status !== "completed" && !l.attendanceMarked)
    .map((l) => ({
      id: `att-${l.id}`,
      title: `Mark attendance — ${l.title}`,
      course: l.group,
      dueLabel: l.startTime,
      priority: l.status === "live" ? "high" : "medium",
      type: "attendance",
    }));

  const analytics: TeacherAnalyticsSummary[] = [
    {
      label: "Today’s lessons",
      value: lessonsToday.length,
    },
    {
      label: "Groups",
      value: teacherGroups.length,
    },
    {
      label: "At-risk",
      value: atRiskStudents.length,
      trend: atRiskStudents.length > 0 ? "down" : "up",
    },
    {
      label: "Open tasks",
      value: pendingTasks.length,
    },
  ];

  return {
    profile,
    analytics,
    lessons: lessonsToday,
    tasks: pendingTasks,
    atRiskStudents,
    groups: teacherGroups,
  };
}
