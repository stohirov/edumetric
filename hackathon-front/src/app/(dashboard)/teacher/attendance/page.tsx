"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BulkAttendancePage } from "@/components/attendance/bulk-attendance-page";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { attendanceApi, groupsApi, lessonsApi } from "@/lib/api";
import type {
  AttendanceDto,
  AttendanceStatusApi,
  LessonDto,
  StudentDto,
} from "@/types/api";
import type {
  AttendanceSession,
  AttendanceStatus,
  RosterStudent,
  StudentAttendanceEntry,
} from "@/types/attendance";

function statusFromBackend(s: AttendanceStatusApi): AttendanceStatus {
  return s.toLowerCase() as AttendanceStatus;
}

function statusToBackend(s: AttendanceStatus): AttendanceStatusApi {
  return s.toUpperCase() as AttendanceStatusApi;
}

function sessionFromLesson(lesson: LessonDto): AttendanceSession {
  const date = new Date(lesson.scheduledAt);
  const valid = !Number.isNaN(date.getTime());
  return {
    id: String(lesson.id),
    courseName: lesson.courseName || lesson.topic || "Lesson",
    groupName: lesson.groupName ?? "",
    date: valid ? date.toLocaleDateString() : "",
    time: valid
      ? date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    room: "—",
  };
}

function rosterFromStudents(students: StudentDto[]): RosterStudent[] {
  return students.map((s) => ({
    id: String(s.id),
    name: s.fullName,
    studentId: `#${s.id}`,
  }));
}

function entriesFromAttendance(
  roster: RosterStudent[],
  attendance: AttendanceDto[],
): Record<string, StudentAttendanceEntry> {
  const byStudent = new Map<number, AttendanceDto>();
  for (const a of attendance) byStudent.set(a.studentId, a);
  return Object.fromEntries(
    roster.map((s) => {
      const dto = byStudent.get(Number(s.id));
      return [
        s.id,
        {
          studentId: s.id,
          status: dto ? statusFromBackend(dto.status) : "present",
          note: dto?.comment ?? "",
        },
      ];
    }),
  );
}

export default function TeacherAttendancePage() {
  const { user, status } = useAuth();
  const t = useT();
  const tt = t.pages.teacherAttendance;
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const lessonsQuery = useAsync(
    () => lessonsApi.getTodayLessons(),
    [user?.id],
  );

  const activeLessonId = selectedLessonId ?? lessonsQuery.data?.[0]?.id ?? null;
  const lesson = lessonsQuery.data?.find((l) => l.id === activeLessonId) ?? null;

  const detailQuery = useAsync(
    async () => {
      if (!lesson) return null;
      const [attendance, studentsPage] = await Promise.all([
        lessonsApi.getLessonAttendance(lesson.id).catch(() => []),
        groupsApi
          .listGroupStudents(lesson.groupId, { page: 0, size: 200 })
          .catch(() => ({
            items: [] as StudentDto[],
            page: 0,
            size: 0,
            total: 0,
            totalPages: 0,
          })),
      ]);
      const roster = rosterFromStudents(studentsPage.items);
      return {
        session: sessionFromLesson(lesson),
        roster,
        initialEntries: entriesFromAttendance(roster, attendance),
        lessonId: lesson.id,
      };
    },
    [lesson?.id],
  );

  const headerLessons = lessonsQuery.data ?? [];

  const persist = useMemo(() => {
    if (!detailQuery.data) return undefined;
    const lessonId = detailQuery.data.lessonId;
    return async (entries: Record<string, StudentAttendanceEntry>) => {
      await attendanceApi.bulkUpsertAttendance({
        lessonId,
        entries: Object.values(entries).map((e) => ({
          studentId: Number(e.studentId),
          status: statusToBackend(e.status),
          comment: e.note || undefined,
        })),
      });
    };
  }, [detailQuery.data]);

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
    <DashboardShell
      role="teacher"
      userName={user?.fullName ?? ""}
      userEmail={user?.email ?? ""}
    >
      <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
        {status === "loading" || lessonsQuery.loading ? (
          <LoadingState label={tt.loadingLessons} />
        ) : lessonsQuery.error ? (
          <ErrorState
            message={lessonsQuery.error.message}
            onRetry={lessonsQuery.reload}
          />
        ) : headerLessons.length === 0 ? (
          <EmptyState
            title={tt.noLessons}
            message={tt.noLessonsMsg}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {headerLessons.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedLessonId(l.id)}
                  className={
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors " +
                    (l.id === activeLessonId
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                  }
                >
                  {l.courseName}
                  <span className="ml-2 text-xs text-slate-400">{l.groupName}</span>
                </button>
              ))}
            </div>

            {detailQuery.loading ? (
              <LoadingState label={tt.loadingRoster} />
            ) : detailQuery.error ? (
              <ErrorState
                message={detailQuery.error.message}
                onRetry={detailQuery.reload}
              />
            ) : detailQuery.data ? (
              <BulkAttendancePage
                session={detailQuery.data.session}
                students={detailQuery.data.roster}
                initialEntries={detailQuery.data.initialEntries}
                onPersist={persist}
              />
            ) : null}
          </>
        )}
      </div>
    </DashboardShell>
    </RouteGuard>
  );
}
