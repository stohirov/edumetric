"use client";

import { useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { parentsApi, usersApi, studentsApi, ApiError } from "@/lib/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

export default function AdminParentsPage() {
  const { user } = useAuth();
  const t = useT();

  const parentsQuery = useAsync(
    () => usersApi.listUsers({ role: "PARENT", page: 0, size: 200 }),
    [user?.id],
  );
  const studentsQuery = useAsync(
    () => studentsApi.listStudents({ page: 0, size: 200 }),
    [user?.id],
  );

  const [parentUserId, setParentUserId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [relationship, setRelationship] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const linksQuery = useAsync(
    () =>
      parentUserId
        ? parentsApi.listLinksByParent(Number(parentUserId))
        : Promise.resolve([]),
    [parentUserId],
  );

  async function handleCreate() {
    if (!parentUserId || !studentId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const trimmed = relationship.trim();
      await parentsApi.createLink({
        parentUserId: Number(parentUserId),
        studentId: Number(studentId),
        relationship: trimmed === "" ? undefined : trimmed,
      });
      setStudentId("");
      setRelationship("");
      linksQuery.reload();
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setFormError(null);
    try {
      await parentsApi.deleteLink(id);
      linksQuery.reload();
    } catch (e) {
      setFormError(errorMessage(e));
    }
  }

  const loading = parentsQuery.loading || studentsQuery.loading;
  const loadError = parentsQuery.error ?? studentsQuery.error;

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.parents}
          description="Link parent accounts to the students they can follow."
        />
        <div className="space-y-6 p-8">
          {loading ? (
            <LoadingState />
          ) : loadError ? (
            <ErrorState
              message={loadError.message}
              onRetry={() => {
                parentsQuery.reload();
                studentsQuery.reload();
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Link parent to student</CardTitle>
                <CardDescription>
                  Select a parent and a student, then create the link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Parent</Label>
                    <Select
                      value={parentUserId}
                      onValueChange={setParentUserId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent" />
                      </SelectTrigger>
                      <SelectContent>
                        {(parentsQuery.data?.items ?? []).map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.fullName} ({p.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Student</Label>
                    <Select value={studentId} onValueChange={setStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {(studentsQuery.data?.items ?? []).map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g. Mother"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleCreate}
                    disabled={!parentUserId || !studentId || submitting}
                  >
                    <Link2 className="h-4 w-4" />
                    {submitting ? "Creating…" : "Create link"}
                  </Button>
                  {formError && (
                    <p className="text-sm text-red-600">{formError}</p>
                  )}
                </div>

                {parentUserId && (
                  <div className="space-y-3 border-t border-theme pt-5">
                    <h3 className="text-sm font-semibold text-theme">
                      Existing links
                    </h3>
                    {linksQuery.loading ? (
                      <p className="text-sm text-theme-muted">Loading…</p>
                    ) : linksQuery.error ? (
                      <p className="text-sm text-red-600">
                        {linksQuery.error.message}
                      </p>
                    ) : (linksQuery.data ?? []).length === 0 ? (
                      <p className="text-sm text-theme-muted">
                        This parent has no linked students yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-theme">
                        <table className="w-full text-left text-[13px]">
                          <thead className="bg-slate-50 text-theme-muted dark:bg-slate-800/50">
                            <tr>
                              <th className="px-3 py-2 font-medium">Student</th>
                              <th className="px-3 py-2 font-medium">
                                Relationship
                              </th>
                              <th className="px-3 py-2 font-medium text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(linksQuery.data ?? []).map((link) => (
                              <tr
                                key={link.id}
                                className="border-t border-theme"
                              >
                                <td className="px-3 py-2 text-theme">
                                  {link.studentName}
                                </td>
                                <td className="px-3 py-2 text-theme-muted">
                                  {link.relationship ?? "—"}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(link.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
