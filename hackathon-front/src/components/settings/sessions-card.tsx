"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { useAsync } from "@/lib/use-async";

/** Best-effort human label for a raw User-Agent string. */
function deviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const ua = userAgent;
  const browser =
    /Edg\//.test(ua) ? "Edge"
      : /OPR\/|Opera/.test(ua) ? "Opera"
        : /Chrome\//.test(ua) ? "Chrome"
          : /Firefox\//.test(ua) ? "Firefox"
            : /Safari\//.test(ua) ? "Safari"
              : "Browser";
  const os =
    /Windows/.test(ua) ? "Windows"
      : /Mac OS X|Macintosh/.test(ua) ? "macOS"
        : /Android/.test(ua) ? "Android"
          : /iPhone|iPad|iOS/.test(ua) ? "iOS"
            : /Linux/.test(ua) ? "Linux"
              : "";
  return os ? `${browser} on ${os}` : browser;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export function SessionsCard() {
  const query = useAsync(() => authApi.listSessions(), []);
  const [busyId, setBusyId] = useState<number | "others" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const sessions = query.data;

  const revokeOne = async (id: number) => {
    setBusyId(id);
    setActionError(null);
    try {
      await authApi.revokeSession(id);
      query.reload();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to revoke session");
    } finally {
      setBusyId(null);
    }
  };

  const revokeOthers = async () => {
    setBusyId("others");
    setActionError(null);
    try {
      await authApi.revokeOtherSessions();
      query.reload();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to revoke sessions");
    } finally {
      setBusyId(null);
    }
  };

  const hasOthers = (sessions ?? []).some((s) => !s.current);
  const error = actionError ?? query.error?.message ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Devices currently signed in to your account. Revoke any you don&apos;t recognise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {query.loading ? (
          <p className="text-sm text-theme-muted">Loading…</p>
        ) : !sessions || sessions.length === 0 ? (
          <p className="text-sm text-theme-muted">No active sessions.</p>
        ) : (
          <ul className="divide-y divide-theme rounded-md border border-theme">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-theme">
                      {deviceLabel(s.userAgent)}
                    </span>
                    {s.current ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        This device
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-theme-muted">
                    {s.ipAddress ?? "Unknown IP"} · Last active {formatWhen(s.lastUsedAt)}
                  </p>
                </div>
                {!s.current ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyId !== null}
                    onClick={() => revokeOne(s.id)}
                  >
                    {busyId === s.id ? "Revoking…" : "Revoke"}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {hasOthers ? (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busyId !== null}
              onClick={revokeOthers}
            >
              {busyId === "others" ? "Signing out…" : "Log out everywhere else"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
