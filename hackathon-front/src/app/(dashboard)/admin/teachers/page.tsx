"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { TeachersTable } from "@/components/dashboard/teachers-table";
import { AddTeacherDialog } from "@/components/teachers/add-teacher-dialog";
import { EditTeacherDialog } from "@/components/teachers/edit-teacher-dialog";
import { DeleteTeacherDialog } from "@/components/teachers/delete-teacher-dialog";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { teachersApi } from "@/lib/api";
import type { TeacherDto } from "@/types/api";

export default function AdminTeachersPage() {
  const { user } = useAuth();
  const t = useT();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherDto | null>(null);
  const [deleting, setDeleting] = useState<TeacherDto | null>(null);

  const query = useAsync(
    () => teachersApi.listTeachers({ page: 0, size: 200 }),
    [user?.id],
  );

  const teachersById = useMemo(() => {
    const map = new Map<number, TeacherDto>();
    for (const tch of query.data?.items ?? []) {
      map.set(tch.id, tch);
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
          title={t.pages.adminTeachers.title}
          description={t.pages.adminTeachers.desc}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add teacher
            </Button>
          }
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <TeachersTable
              teachers={query.data?.items ?? []}
              title={t.pages.adminTeachers.card}
              description={t.pages.adminTeachers.desc}
              onEdit={(id) => {
                const tch = teachersById.get(id);
                if (tch) setEditing(tch);
              }}
              onDelete={(id) => {
                const tch = teachersById.get(id);
                if (tch) setDeleting(tch);
              }}
            />
          )}
        </div>
        <AddTeacherDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onCreated={query.reload}
        />
        <EditTeacherDialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          teacher={editing}
          onUpdated={query.reload}
        />
        <DeleteTeacherDialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          teacher={deleting}
          onDeleted={query.reload}
        />
      </DashboardShell>
    </RouteGuard>
  );
}
