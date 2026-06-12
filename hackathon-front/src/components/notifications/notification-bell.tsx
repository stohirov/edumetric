"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { NotificationDto } from "@/types/api/notifications";
import {
  formatRelative,
  resolveNotificationLink,
  roleBasePath,
} from "./format-relative";

const POLL_MS = 30_000;

/** Header bell: polls the unread count and opens a dropdown feed of recent notifications. */
export function NotificationBell() {
  const { user } = useAuth();
  const t = useT();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);

  const base = roleBasePath(user?.role);
  const tt = t.notifications;

  const refreshCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      setCount(res.count);
    } catch {
      /* transient — keep last known count */
    }
  }, []);

  // Poll the unread count while signed in.
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, count updates after await
    void refreshCount();
    const id = window.setInterval(refreshCount, POLL_MS);
    return () => window.clearInterval(id);
  }, [user, refreshCount]);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await notificationsApi.listNotifications());
    } catch {
      /* surfaced on the full page instead */
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) await loadItems();
  }

  async function handleItem(n: NotificationDto) {
    setOpen(false);
    if (!n.read) {
      try {
        await notificationsApi.markRead(n.id);
        setCount((c) => Math.max(0, c - 1));
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
    setCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-lg"
        aria-label={tt.title}
        onClick={toggleOpen}
      >
        <Bell className="h-4 w-4 text-theme-muted" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[var(--card)]">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-theme bg-[var(--card)] shadow-lg">
          <div className="flex items-center justify-between border-b border-theme px-4 py-3">
            <span className="text-sm font-semibold text-theme">{tt.title}</span>
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1 text-xs text-theme-muted transition-colors hover:text-theme"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {tt.markAllRead}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-theme-muted">{tt.loading}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-theme-muted">{tt.empty}</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.slice(0, 8).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItem(n)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                        !n.read && "bg-indigo-50/50 dark:bg-indigo-950/20",
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-theme">
                        {!n.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                        )}
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="line-clamp-2 text-xs text-theme-muted">{n.body}</span>
                      )}
                      <span className="text-[11px] text-theme-muted">
                        {formatRelative(n.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href={`${base}/notifications`}
            onClick={() => setOpen(false)}
            className="block border-t border-theme px-4 py-2.5 text-center text-xs font-medium text-indigo-600 hover:underline"
          >
            {tt.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}
