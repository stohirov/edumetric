"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { LessonsTable } from "@/components/lessons/lessons-table";
import { AddLessonDialog } from "@/components/lessons/add-lesson-dialog";
import { EditLessonDialog } from "@/components/lessons/edit-lesson-dialog";
import { DeleteLessonDialog } from "@/components/lessons/delete-lesson-dialog";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { lessonsApi } from "@/lib/api";
import type { LessonDto } from "@/types/api";

export default function AdminLessonsPage() {
  const { user } = useAuth();
  const tt = useT().pages.adminLessons;
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<LessonDto | null>(null);
  const [deleting, setDeleting] = useState<LessonDto | null>(null);

  const query = useAsync(
    () => lessonsApi.listLessons({ page: 0, size: 200 }),
    [user?.id],
  );

  const lessonsById = useMemo(() => {
    const map = new Map<number, LessonDto>();
    for (const l of query.data?.items ?? []) {
      map.set(l.id, l);
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
              {tt.addLesson}
            </Button>
          }
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <LessonsTable
              lessons={query.data?.items ?? []}
              onEdit={(id) => {
                const l = lessonsById.get(id);
                if (l) setEditing(l);
              }}
              onDelete={(id) => {
                const l = lessonsById.get(id);
                if (l) setDeleting(l);
              }}
            />
          )}
        </div>
        <AddLessonDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onCreated={query.reload}
        />
        <EditLessonDialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          lesson={editing}
          onUpdated={query.reload}
        />
        <DeleteLessonDialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          lesson={deleting}
          onDeleted={query.reload}
        />
      </DashboardShell>
    </RouteGuard>
  );
}
