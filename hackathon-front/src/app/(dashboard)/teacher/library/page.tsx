"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { ApiError, contentApi, libraryApi } from "@/lib/api";
import type { LibraryItemDto } from "@/types/api";

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes <= 0) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

export default function TeacherLibraryPage() {
  const { user } = useAuth();
  const t = useT();
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const query = useAsync(() => libraryApi.listLibrary(), [user?.id]);

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = query.data ?? [];
    if (!term) return all;
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.courseName.toLowerCase().includes(term) ||
        item.moduleTitle.toLowerCase().includes(term),
    );
  }, [query.data, search]);

  async function handleDownload(item: LibraryItemDto) {
    setDownloadError(null);
    setDownloadingId(item.materialId);
    try {
      const blob = await contentApi.downloadMaterialFile(item.materialId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.fileName ?? item.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(errorMessage(e));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.library}
          description="Browse and download every downloadable file across your courses."
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState
              message={errorMessage(query.error)}
              onRetry={query.reload}
            />
          ) : (
            <Card>
              <div className="flex flex-col gap-3 border-b border-theme p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, course, or module"
                    className="h-9 w-full rounded-lg border border-theme bg-transparent pl-9 pr-3 text-sm text-theme outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                {downloadError && (
                  <p className="text-xs text-red-500">{downloadError}</p>
                )}
              </div>

              {items.length === 0 ? (
                <EmptyState
                  title="No files found"
                  message="There are no downloadable files matching your search."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-xs uppercase tracking-wide text-theme-muted">
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Course</th>
                        <th className="px-4 py-3 font-medium">Module</th>
                        <th className="px-4 py-3 font-medium">Size</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.materialId}
                          className="border-b border-theme/60 last:border-0"
                        >
                          <td className="px-4 py-3 font-medium text-theme">
                            {item.title}
                          </td>
                          <td className="px-4 py-3 text-theme-muted">
                            {item.courseName}
                          </td>
                          <td className="px-4 py-3 text-theme-muted">
                            {item.moduleTitle}
                          </td>
                          <td className="px-4 py-3 text-theme-muted">
                            {formatBytes(item.fileSize)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={downloadingId === item.materialId}
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="h-4 w-4" />
                              {downloadingId === item.materialId
                                ? "Downloading…"
                                : "Download"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
