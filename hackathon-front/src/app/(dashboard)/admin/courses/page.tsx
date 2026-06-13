"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { CoursesTable } from "@/components/courses/courses-table";
import { AddCourseDialog } from "@/components/courses/add-course-dialog";
import { EditCourseDialog } from "@/components/courses/edit-course-dialog";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { coursesApi } from "@/lib/api";
import type { CourseDto } from "@/types/api";

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const tt = useT().pages.adminCourses;
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<CourseDto | null>(null);
  const [deleting, setDeleting] = useState<CourseDto | null>(null);

  const query = useAsync(
    () => coursesApi.listCourses({ page: 0, size: 200 }),
    [user?.id],
  );

  const coursesById = useMemo(() => {
    const map = new Map<number, CourseDto>();
    for (const c of query.data?.items ?? []) {
      map.set(c.id, c);
    }
    return map;
  }, [query.data]);

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={tt.title}
          description={tt.desc}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              {tt.addCourse}
            </Button>
          }
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <CoursesTable
              courses={query.data?.items ?? []}
              onEdit={(id) => {
                const c = coursesById.get(id);
                if (c) setEditing(c);
              }}
              onDelete={(id) => {
                const c = coursesById.get(id);
                if (c) setDeleting(c);
              }}
            />
          )}
        </div>
        <AddCourseDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onCreated={query.reload}
        />
        <EditCourseDialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          course={editing}
          onUpdated={query.reload}
        />
        <DeleteCourseDialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          course={deleting}
          onDeleted={query.reload}
        />
      </DashboardShell>
    </RouteGuard>
  );
}
