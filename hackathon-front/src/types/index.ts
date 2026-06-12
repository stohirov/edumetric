export type UserRole = "student" | "teacher" | "admin" | "parent";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  attendance: number;
  gpa: number;
  status: "active" | "at-risk" | "inactive";
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  studentName: string;
  class: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
