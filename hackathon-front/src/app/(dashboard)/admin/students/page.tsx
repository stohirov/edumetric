"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { StudentsTable } from "@/components/dashboard/students-table";
import { AddStudentDialog } from "@/components/students/add-student-dialog";
import { EditStudentDialog } from "@/components/students/edit-student-dialog";
import { DeleteStudentDialog } from "@/components/students/delete-student-dialog";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { studentsApi } from "@/lib/api";
import { studentDtoToRow } from "@/lib/adapters/student-row";
import type { StudentDto } from "@/types/api";

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const t = useT();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<StudentDto | null>(null);
  const [deleting, setDeleting] = useState<StudentDto | null>(null);

  const query = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );

  const studentsById = useMemo(() => {
    const map = new Map<string, StudentDto>();
    for (const s of query.data?.items ?? []) {
      map.set(String(s.id), s);
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
          title={t.pages.adminStudents.title}
          description={t.pages.adminStudents.desc}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              {t.common.addStudent}
            </Button>
          }
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <StudentsTable
              students={(query.data?.items ?? []).map(studentDtoToRow)}
              onEdit={(id) => {
                const s = studentsById.get(id);
                if (s) setEditing(s);
              }}
              onDelete={(id) => {
                const s = studentsById.get(id);
                if (s) setDeleting(s);
              }}
            />
          )}
        </div>
        <AddStudentDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onCreated={query.reload}
        />
        <EditStudentDialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          student={editing}
          onUpdated={query.reload}
        />
        <DeleteStudentDialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          student={deleting}
          onDeleted={query.reload}
        />
      </DashboardShell>
    </RouteGuard>
  );
}
