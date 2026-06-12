"use client";

import { useState } from "react";
import { CalendarRange, Star, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { organizationApi, ApiError } from "@/lib/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

export default function AdminTermsPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(() => organizationApi.listTerms(), [user?.id]);

  // Create form state
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Row action state
  const [rowError, setRowError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateError(null);
    if (!name.trim() || !startDate || !endDate) {
      setCreateError("Name, start date and end date are required.");
      return;
    }
    setCreating(true);
    try {
      await organizationApi.createTerm({
        name: name.trim(),
        startDate,
        endDate,
        current,
      });
      setName("");
      setStartDate("");
      setEndDate("");
      setCurrent(false);
      query.reload();
    } catch (e) {
      setCreateError(errorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const makeCurrent = async (id: number) => {
    setRowError(null);
    setBusyId(id);
    try {
      await organizationApi.updateTerm(id, { current: true });
      query.reload();
    } catch (e) {
      setRowError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    setRowError(null);
    setBusyId(id);
    try {
      await organizationApi.deleteTerm(id);
      query.reload();
    } catch (e) {
      setRowError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const terms = query.data ?? [];

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.terms}
          description="Define the academic terms used across the institution."
        />
        <div className="space-y-6 p-8">
          <Card>
            <CardHeader>
              <CardTitle>Add academic term</CardTitle>
              <CardDescription>
                Create a term with its start and end dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={submitCreate}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="term-name">Name</Label>
                  <Input
                    id="term-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Fall 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term-start">Start date</Label>
                  <Input
                    id="term-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term-end">End date</Label>
                  <Input
                    id="term-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3 flex items-center gap-2">
                  <input
                    id="term-current"
                    type="checkbox"
                    className="h-4 w-4 rounded border-theme accent-indigo-600"
                    checked={current}
                    onChange={(e) => setCurrent(e.target.checked)}
                  />
                  <Label htmlFor="term-current" className="cursor-pointer">
                    Set as current term
                  </Label>
                </div>
                {createError ? (
                  <div className="sm:col-span-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {createError}
                  </div>
                ) : null}
                <div className="sm:col-span-3 flex justify-end">
                  <Button type="submit" size="sm" disabled={creating}>
                    {creating ? "Adding…" : "Add term"}
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
                <CardTitle>Academic terms</CardTitle>
                <CardDescription>
                  Terms defined for your institution.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {rowError ? (
                  <div className="mx-6 mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {rowError}
                  </div>
                ) : null}
                {terms.length === 0 ? (
                  <EmptyState
                    title="No academic terms yet"
                    message="Terms will appear here once they are created."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-theme bg-table-head">
                          <th className="px-6 py-3 text-left text-label">
                            Term
                          </th>
                          <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                            Start
                          </th>
                          <th className="hidden px-4 py-3 text-left text-label sm:table-cell">
                            End
                          </th>
                          <th
                            className="w-40 px-4 py-3"
                            aria-label="actions"
                          />
                        </tr>
                      </thead>
                      <tbody>
                        {terms.map((term) => (
                          <tr
                            key={term.id}
                            className="border-b border-theme transition-colors last:border-0 hover-table-row"
                          >
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                                  <CalendarRange className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-theme">
                                    {term.name}
                                  </p>
                                  {term.current ? (
                                    <Badge variant="success">Current</Badge>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                              {term.startDate}
                            </td>
                            <td className="hidden px-4 py-3.5 text-theme-muted sm:table-cell">
                              {term.endDate}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                {!term.current ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5"
                                    aria-label={`Make ${term.name} current`}
                                    disabled={busyId === term.id}
                                    onClick={() => makeCurrent(term.id)}
                                  >
                                    <Star className="h-3.5 w-3.5" />
                                    Make current
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
                                  aria-label={`Delete ${term.name}`}
                                  disabled={busyId === term.id}
                                  onClick={() => remove(term.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-theme-muted" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
