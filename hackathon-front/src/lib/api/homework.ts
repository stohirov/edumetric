import type {
  HomeworkAssignmentDto,
  SubmissionDto,
  SubmitHomeworkInput,
  TeacherSubmissionDto,
} from "@/types/api/homework";
import { api, API_BASE_URL, ApiError, getToken } from "./client";

/** All assignments for the current student, with submission + grade state. */
export function getMyHomework(): Promise<HomeworkAssignmentDto[]> {
  return api.get<HomeworkAssignmentDto[]>("/homework/me");
}

/** Create or update the student's submission for an assignment (multipart). */
export function submitHomework(
  assignmentId: number,
  input: SubmitHomeworkInput,
): Promise<SubmissionDto> {
  const form = new FormData();
  if (input.comment != null && input.comment.length > 0) {
    form.append("comment", input.comment);
  }
  if (input.file) {
    form.append("file", input.file);
  }
  return api.post<SubmissionDto>(`/homework/${assignmentId}/submit`, form);
}

/** Fetches the previously uploaded file as a Blob (for download / preview). */
export async function downloadHomeworkFile(assignmentId: number): Promise<Blob> {
  return fetchFileBlob(`/homework/${assignmentId}/file`);
}

/** Teacher view: every student's submission for an assignment, with grade state. */
export function getSubmissions(
  assignmentId: number,
): Promise<TeacherSubmissionDto[]> {
  return api.get<TeacherSubmissionDto[]>(
    `/homework/assignments/${assignmentId}/submissions`,
  );
}

/** Teacher view: download a single student's submitted file as a Blob. */
export async function downloadSubmissionFile(
  submissionId: number,
): Promise<Blob> {
  return fetchFileBlob(`/homework/submissions/${submissionId}/file`);
}

async function fetchFileBlob(path: string): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiError("Failed to download file", response.status);
  }
  return response.blob();
}
