"use client";

import { useState } from "react";
import { Building2, Check, Pencil, Trash2, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState, EmptyState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { organizationApi, ApiError } from "@/lib/api";
import type { DepartmentDto } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

interface EditState {
  name: string;
  code: string;
  description: string;
}

export default function AdminDepartmentsPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(() => organizationApi.listDepartments(), [user?.id]);

  // Create form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditState>({
    name: "",
    code: "",
    description: "",
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    if (!name.trim() || !code.trim()) {
      setCreateError("Name and code are required.");
      return;
    }
    setCreating(true);
    try {
      await organizationApi.createDepartment({
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setCode("");
      setDescription("");
      query.reload();
    } catch (e) {
      setCreateError(errorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (dept: DepartmentDto) => {
    setRowError(null);
    setEditingId(dept.id);
    setEditForm({
      name: dept.name,
      code: dept.code,
      description: dept.description ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowError(null);
  };

  const saveEdit = async (id: number) => {
    setRowError(null);
    if (!editForm.name.trim() || !editForm.code.trim()) {
      setRowError("Name and code are required.");
      return;
    }
    setSavingId(id);
    try {
      await organizationApi.updateDepartment(id, {
        name: editForm.name.trim(),
        code: editForm.code.trim(),
        description: editForm.description.trim() || undefined,
      });
      setEditingId(null);
      query.reload();
    } catch (e) {
      setRowError(errorMessage(e));
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: number) => {
    setRowError(null);
    setDeletingId(id);
    try {
      await organizationApi.deleteDepartment(id);
      if (editingId === id) setEditingId(null);
      query.reload();
    } catch (e) {
      setRowError(errorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const departments = query.data ?? [];

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.departments}
          description="Manage the academic departments at your institution."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Add department</CardTitle>
              <CardDescription>
                Create a new department with a name and a short code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitCreate}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Name</Label>
                  <Input
                    id="dept-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-code">Code</Label>
                  <Input
                    id="dept-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-description">Description</Label>
                  <Input
                    id="dept-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                {createError ? (
                  <div className="sm:col-span-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {createError}
                  </div>
                ) : null}
                <div className="sm:col-span-3 flex justify-end">
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? "Adding…" : "Add department"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <Card interactive>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  Academic departments at your institution.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {rowError ? (
                  <div className="mx-6 mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {rowError}
                  </div>
                ) : null}
                {departments.length === 0 ? (
                  <EmptyState
                    title="No departments yet"
                    message="Departments will appear here once they are created."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-theme bg-table-head">
                          <th className="px-6 py-3 text-left text-label">
                            Department
                          </th>
                          <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                            Code
                          </th>
                          <th className="hidden px-4 py-3 text-left text-label md:table-cell">
                            Description
                          </th>
                          <th
                            className="w-28 px-4 py-3"
                            aria-label="actions"
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((dept) =>
                          editingId === dept.id ? (
                            <tr
                              key={dept.id}
                              className="border-b border-theme last:border-0"
                            >
                              <td className="px-6 py-3">
                                <Input
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      name: e.target.value,
                                    }))
                                  }
                                  aria-label="Name"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  value={editForm.code}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      code: e.target.value,
                                    }))
                                  }
                                  aria-label="Code"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  value={editForm.description}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      description: e.target.value,
                                    }))
                                  }
                                  aria-label="Description"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Save"
                                    disabled={savingId === dept.id}
                                    onClick={() => saveEdit(dept.id)}
                                  >
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Cancel"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-4 w-4 text-theme-muted" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr
                              key={dept.id}
                              className="border-b border-theme transition-colors last:border-0 hover-table-row"
                            >
                              <td className="px-6 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                                    <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-theme">
                                      {dept.name}
                                    </p>
                                    <p className="text-xs text-theme-muted sm:hidden">
                                      {dept.code}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                                {dept.code}
                              </td>
                              <td className="hidden max-w-md truncate px-4 py-3.5 text-theme-muted md:table-cell">
                                {dept.description || "—"}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label={`Edit ${dept.name}`}
                                    onClick={() => startEdit(dept)}
                                  >
                                    <Pencil className="h-4 w-4 text-theme-muted" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                                    aria-label={`Delete ${dept.name}`}
                                    disabled={deletingId === dept.id}
                                    onClick={() => remove(dept.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-theme-muted" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
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
