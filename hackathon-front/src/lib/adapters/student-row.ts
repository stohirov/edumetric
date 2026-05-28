// Convert backend StudentDto / AtRiskStudentDto into the UI `Student` row
// shape consumed by <StudentsTable>.

import type { AtRiskStudentDto, StudentDto } from "@/types/api";
import type { Student } from "@/types";

export function studentDtoToRow(s: StudentDto): Student {
  return {
    id: String(s.id),
    name: s.fullName,
    email: s.email,
    grade: s.groupName ?? "—",
    attendance: 0,
    gpa: 0,
    status: "active",
  };
}

export function atRiskDtoToRow(s: AtRiskStudentDto): Student {
  return {
    id: String(s.studentId),
    name: s.fullName,
    email: "",
    grade: s.groupName,
    attendance: Math.round(Number(s.attendanceNorm)),
    gpa: Math.round(Number(s.compositeScore) * 100) / 100,
    status: "at-risk",
  };
}
