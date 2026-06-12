"use client";

import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { NotificationDto } from "@/types/api/notifications";
import {
  formatRelative,
  resolveNotificationLink,
  roleBasePath,
} from "./format-relative";

/** Full notification list shared by the per-role notification pages. */
export function NotificationsFeed() {
  const { user } = useAuth();
  const t = useT();
  const router = useRouter();
  const tt = t.notifications;
  const base = roleBasePath(user?.role);

  const query = useAsync(() => notificationsApi.listNotifications(), [user?.id]);
  const items = query.data ?? [];
  const hasUnread = items.some((n) => !n.read);

  async function handleItem(n: NotificationDto) {
    if (!n.read) {
      try {
        await notificationsApi.markRead(n.id);
      } catch {
        /* ignore */
      }
    }
    router.push(resolveNotificationLink(n.link, base));
  }

  async function handleMarkAll() {
    try {
      await notificationsApi.markAllRead();
    } catch {
      /* ignore */
    }
    query.reload();
  }

  if (query.loading) return <LoadingState />;
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.reload} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="secondary" size="sm" onClick={handleMarkAll} disabled={!hasUnread}>
          <CheckCheck className="h-4 w-4" />
          {tt.markAllRead}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-theme-muted">{tt.empty}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleItem(n)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      !n.read && "bg-indigo-50/50 dark:bg-indigo-950/20",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.read ? "bg-transparent" : "bg-indigo-600",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-theme">{n.title}</span>
                      {n.body && (
                        <span className="mt-0.5 block text-sm text-theme-muted">{n.body}</span>
                      )}
                      <span className="mt-1 block text-xs text-theme-muted">
                        {formatRelative(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
