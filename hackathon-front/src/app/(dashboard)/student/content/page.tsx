"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { contentApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { StudentMaterialDto } from "@/types/api/content";

function errMsg(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

export default function StudentContentPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.studentContent;

  const query = useAsync(() => contentApi.getMyContent(), [user?.id]);

  const data = query.data;
  const total = data?.totalMaterials ?? 0;
  const completed = data?.completedMaterials ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{data?.courseName ?? tt.title}</CardTitle>
                  <CardDescription>
                    {tt.progress}: {completed}/{total}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={pct} />
                </CardContent>
              </Card>

              {(data?.modules ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-theme-muted">
                  {tt.noContent}
                </p>
              ) : (
                (data?.modules ?? []).map((mod) => (
                  <Card key={mod.id} className={mod.locked ? "opacity-75" : undefined}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {mod.title}
                        {mod.locked && (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </CardTitle>
                      {mod.summary && (
                        <CardDescription>{mod.summary}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {mod.locked ? (
                        <p className="py-2 text-sm text-theme-muted">
                          Complete the prerequisite module to unlock these materials.
                        </p>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {mod.materials.map((mat) => (
                            <MaterialRow
                              key={mat.id}
                              material={mat}
                              onChanged={query.reload}
                            />
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

function MaterialRow({
  material,
  onChanged,
}: {
  material: StudentMaterialDto;
  onChanged: () => void;
}) {
  const t = useT();
  const tt = t.pages.studentContent;

  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleComplete = async () => {
    setBusy(true);
    setError(null);
    try {
      if (material.completed) {
        await contentApi.unmarkComplete(material.id);
      } else {
        await contentApi.markComplete(material.id);
      }
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    try {
      const blob = await contentApi.downloadStudentMaterialFile(material.id);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = material.fileName ?? "material";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      setError(errMsg(e, tt.error));
    }
  };

  return (
    <li className="py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-theme">
            <span className="truncate">{material.title}</span>
            <Badge variant="secondary">{tt.types[material.type]}</Badge>
          </p>

          {material.type === "PAGE" && material.content && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              {expanded ? tt.hideContent : tt.showContent}
            </button>
          )}

          {(material.type === "LINK" || material.type === "VIDEO") &&
            material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink className="h-3 w-3" />
                {tt.open}
              </a>
            )}

          {material.type === "FILE" && material.hasFile && (
            <button
              type="button"
              onClick={download}
              className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <Download className="h-3 w-3" />
              {material.fileName ?? tt.download}
            </button>
          )}
        </div>

        <Button
          type="button"
          variant={material.completed ? "secondary" : "outline"}
          size="sm"
          disabled={busy}
          onClick={toggleComplete}
          className="shrink-0 gap-1.5"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : material.completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
          {material.completed ? tt.completed : tt.markComplete}
        </Button>
      </div>

      {expanded && material.content && (
        <div className="mt-2 flex gap-2 rounded-[10px] border border-theme bg-slate-50/60 p-3 text-sm text-theme">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="whitespace-pre-wrap">{material.content}</p>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </li>
  );
}
