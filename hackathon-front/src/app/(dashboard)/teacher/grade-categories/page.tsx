"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Save, X, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState, EmptyState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { coursesApi, gradingApi, ApiError } from "@/lib/api";
import type { GradeCategoryDto } from "@/types/api";

function toMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

interface EditState {
  name: string;
  weight: string;
  position: string;
}

export default function TeacherGradeCategoriesPage() {
  const { user } = useAuth();
  const t = useT();

  const [courseId, setCourseId] = useState<number | null>(null);

  const coursesQuery = useAsync(
    () => coursesApi.listCourses({ page: 0, size: 200 }),
    [user?.id],
  );

  const categoriesQuery = useAsync(
    () =>
      courseId === null
        ? Promise.resolve<GradeCategoryDto[]>([])
        : gradingApi.listCategories(courseId),
    [courseId],
  );

  const categories = categoriesQuery.data ?? [];

  const weightSum = useMemo(
    () => categories.reduce((sum, c) => sum + (Number(c.weight) || 0), 0),
    [categories],
  );

  // Add form state
  const [addName, setAddName] = useState("");
  const [addWeight, setAddWeight] = useState("");
  const [addPosition, setAddPosition] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({
    name: "",
    weight: "",
    position: "",
  });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (courseId === null) return;
    setFormError(null);
    setAdding(true);
    try {
      await gradingApi.createCategory({
        courseId,
        name: addName.trim(),
        weight: Number(addWeight),
        position: addPosition === "" ? undefined : Number(addPosition),
      });
      setAddName("");
      setAddWeight("");
      setAddPosition("");
      categoriesQuery.reload();
    } catch (err) {
      setFormError(toMessage(err));
    } finally {
      setAdding(false);
    }
  }

  function startEdit(c: GradeCategoryDto) {
    setEditingId(c.id);
    setEditState({
      name: c.name,
      weight: String(c.weight),
      position: String(c.position),
    });
    setFormError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: number) {
    setFormError(null);
    setSavingId(id);
    try {
      await gradingApi.updateCategory(id, {
        name: editState.name.trim(),
        weight: Number(editState.weight),
        position: Number(editState.position),
      });
      setEditingId(null);
      categoriesQuery.reload();
    } catch (err) {
      setFormError(toMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    setFormError(null);
    setDeletingId(id);
    try {
      await gradingApi.deleteCategory(id);
      if (editingId === id) setEditingId(null);
      categoriesQuery.reload();
    } catch (err) {
      setFormError(toMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const courses = coursesQuery.data?.items ?? [];

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.gradeCategories}
          description="Define weighted grade categories for each course."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Course</CardTitle>
              <CardDescription>
                Pick a course to manage its grade categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesQuery.loading ? (
                <LoadingState />
              ) : coursesQuery.error ? (
                <ErrorState
                  message={coursesQuery.error.message}
                  onRetry={coursesQuery.reload}
                />
              ) : (
                <div className="max-w-sm space-y-2">
                  <Label htmlFor="course-select">Course</Label>
                  <Select
                    value={courseId === null ? undefined : String(courseId)}
                    onValueChange={(v) => setCourseId(Number(v))}
                  >
                    <SelectTrigger id="course-select">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {courseId !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Add category</CardTitle>
                <CardDescription>
                  Weights across all categories should add up to 100%.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleAdd}
                  className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
                >
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Name</Label>
                    <Input
                      id="add-name"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder="e.g. Homework"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-weight">Weight (%)</Label>
                    <Input
                      id="add-weight"
                      type="number"
                      step="any"
                      value={addWeight}
                      onChange={(e) => setAddWeight(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-position">Position</Label>
                    <Input
                      id="add-position"
                      type="number"
                      value={addPosition}
                      onChange={(e) => setAddPosition(e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                  <Button type="submit" disabled={adding}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </form>
                {formError && (
                  <p className="mt-3 text-sm text-red-500">{formError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {courseId !== null && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Total weight:{" "}
                    <Badge
                      variant={weightSum === 100 ? "default" : "secondary"}
                    >
                      {weightSum}%
                    </Badge>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {weightSum !== 100 && categories.length > 0 && (
                  <p className="mb-4 text-sm text-amber-600">
                    Heads up: category weights add up to {weightSum}%, not 100%.
                  </p>
                )}
                {categoriesQuery.loading ? (
                  <LoadingState />
                ) : categoriesQuery.error ? (
                  <ErrorState
                    message={categoriesQuery.error.message}
                    onRetry={categoriesQuery.reload}
                  />
                ) : categories.length === 0 ? (
                  <EmptyState
                    title="No categories yet"
                    message="Add your first grade category above."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-theme text-left text-theme-muted">
                          <th className="py-2 pr-4 font-medium">Name</th>
                          <th className="py-2 pr-4 font-medium">Weight (%)</th>
                          <th className="py-2 pr-4 font-medium">Position</th>
                          <th className="py-2 pr-4 font-medium text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((c) => {
                          const isEditing = editingId === c.id;
                          return (
                            <tr
                              key={c.id}
                              className="border-b border-theme/60 last:border-0"
                            >
                              <td className="py-2 pr-4">
                                {isEditing ? (
                                  <Input
                                    value={editState.name}
                                    onChange={(e) =>
                                      setEditState((s) => ({
                                        ...s,
                                        name: e.target.value,
                                      }))
                                    }
                                  />
                                ) : (
                                  <span className="text-theme">{c.name}</span>
                                )}
                              </td>
                              <td className="py-2 pr-4">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    step="any"
                                    value={editState.weight}
                                    onChange={(e) =>
                                      setEditState((s) => ({
                                        ...s,
                                        weight: e.target.value,
                                      }))
                                    }
                                  />
                                ) : (
                                  <span className="text-theme">{c.weight}</span>
                                )}
                              </td>
                              <td className="py-2 pr-4">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editState.position}
                                    onChange={(e) =>
                                      setEditState((s) => ({
                                        ...s,
                                        position: e.target.value,
                                      }))
                                    }
                                  />
                                ) : (
                                  <span className="text-theme">
                                    {c.position}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 pr-4">
                                <div className="flex justify-end gap-2">
                                  {isEditing ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => saveEdit(c.id)}
                                        disabled={savingId === c.id}
                                      >
                                        <Save className="h-3.5 w-3.5" />
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={cancelEdit}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEdit(c)}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(c.id)}
                                        disabled={deletingId === c.id}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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
