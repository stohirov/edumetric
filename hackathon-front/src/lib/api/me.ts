// Resolve the domain entity (Student / Teacher) for the current authenticated user.
// Uses the backend's role-scoped /me endpoints so a STUDENT can't accidentally
// trigger /api/students (which requires TEACHER) and a TEACHER doesn't have
// to scan the full /api/teachers page just to find self.

import * as studentsApi from "./students";
import * as teachersApi from "./teachers";
import type { StudentDto, TeacherDto, UserDto } from "@/types/api";

export async function findStudentForUser(
  _user: Pick<UserDto, "id">,
): Promise<StudentDto | null> {
  try {
    return await studentsApi.getMyStudent();
  } catch {
    return null;
  }
}

export async function findTeacherForUser(
  _user: Pick<UserDto, "id">,
): Promise<TeacherDto | null> {
  try {
    return await teachersApi.getMyTeacher();
  } catch {
    return null;
  }
}
