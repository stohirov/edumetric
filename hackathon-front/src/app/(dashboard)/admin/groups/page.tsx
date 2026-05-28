"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { GroupsTable } from "@/components/dashboard/groups-table";
import { AddGroupDialog } from "@/components/groups/add-group-dialog";
import { EditGroupDialog } from "@/components/groups/edit-group-dialog";
import { DeleteGroupDialog } from "@/components/groups/delete-group-dialog";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { groupsApi } from "@/lib/api";
import type { GroupDto } from "@/types/api";

export default function AdminGroupsPage() {
  const { user } = useAuth();
  const t = useT();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<GroupDto | null>(null);
  const [deleting, setDeleting] = useState<GroupDto | null>(null);

  const query = useAsync(
    () => groupsApi.listGroups({ page: 0, size: 200 }),
    [user?.id],
  );

  const groupsById = useMemo(() => {
    const map = new Map<number, GroupDto>();
    for (const g of query.data?.items ?? []) {
      map.set(g.id, g);
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
          title={t.pages.adminGroups.title}
          description={t.pages.adminGroups.desc}
          action={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add group
            </Button>
          }
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <GroupsTable
              groups={query.data?.items ?? []}
              title={t.pages.adminGroups.card}
              description={t.pages.adminGroups.desc}
              onEdit={(id) => {
                const g = groupsById.get(id);
                if (g) setEditing(g);
              }}
              onDelete={(id) => {
                const g = groupsById.get(id);
                if (g) setDeleting(g);
              }}
            />
          )}
        </div>
        <AddGroupDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onCreated={query.reload}
        />
        <EditGroupDialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          group={editing}
          onUpdated={query.reload}
        />
        <DeleteGroupDialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          group={deleting}
          onDeleted={query.reload}
        />
      </DashboardShell>
    </RouteGuard>
  );
}
