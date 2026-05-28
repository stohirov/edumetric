export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export interface AttendanceSession {
  id: string;
  courseName: string;
  groupName: string;
  date: string;
  time: string;
  room: string;
}

export interface RosterStudent {
  id: string;
  name: string;
  studentId: string;
}

export interface StudentAttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note: string;
}

export interface AttendanceRosterState {
  session: AttendanceSession;
  students: RosterStudent[];
  entries: Record<string, StudentAttendanceEntry>;
}
