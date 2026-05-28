export type LessonStatus = "live" | "upcoming" | "completed";

export type TaskPriority = "high" | "medium" | "low";

export type TaskType = "grading" | "attendance" | "review";

export interface TeacherProfile {
  fullName: string;
  email: string;
  department: string;
}

export interface TeacherAnalyticsSummary {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface TodayLesson {
  id: string;
  title: string;
  group: string;
  startTime: string;
  endTime: string;
  room: string;
  students: number;
  status: LessonStatus;
  attendanceMarked: boolean;
}

export interface PendingTask {
  id: string;
  title: string;
  course: string;
  dueLabel: string;
  priority: TaskPriority;
  type: TaskType;
}

export interface AtRiskStudent {
  id: string;
  name: string;
  email: string | null;
  course: string;
  attendance: number;
  gpa: number;
  reason: string;
}

export interface TeacherGroup {
  id: string;
  name: string;
  code: string;
  students: number;
  attendanceRate: number;
  avgScore: number;
  atRiskCount: number;
  nextLesson?: string;
}

export interface TeacherDashboardData {
  profile: TeacherProfile;
  analytics: TeacherAnalyticsSummary[];
  lessons: TodayLesson[];
  tasks: PendingTask[];
  atRiskStudents: AtRiskStudent[];
  groups: TeacherGroup[];
}
