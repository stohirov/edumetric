"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import { ApiError, groupsApi, notificationsApi, teachersApi } from "@/lib/api";
import type { GroupDto } from "@/types/api/groups";
import type {
  AnnouncementScope,
  CreateAnnouncementRequest,
} from "@/types/api/notifications";
import { formatRelative } from "./format-relative";

/** Compose + recent-list view for announcements, shared by teacher and admin. */
export function AnnouncementsManager({ mode }: { mode: "teacher" | "admin" }) {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.announcements;

  const groupsQuery = useAsync<GroupDto[]>(
    () =>
      mode === "admin"
        ? groupsApi.listGroups({ size: 200 }).then((p) => p.items)
        : teachersApi.listMyGroups(),
    [mode, user?.id],
  );
  const groups = groupsQuery.data ?? [];

  const listQuery = useAsync(() => notificationsApi.listAnnouncements(), [user?.id]);
  const announcements = listQuery.data ?? [];

  const [scope, setScope] = useState<AnnouncementScope>(mode === "teacher" ? "GROUP" : "ALL");
  const [groupId, setGroupId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const needsGroup = scope === "GROUP";
  const canSubmit =
    !submitting && title.trim().length > 0 && body.trim().length > 0 && (!needsGroup || groupId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload: CreateAnnouncementRequest = {
        title: title.trim(),
        body: body.trim(),
        scope,
        groupId: needsGroup ? Number(groupId) : null,
      };
      await notificationsApi.createAnnouncement(payload);
      setTitle("");
      setBody("");
      setSuccess(tt.success);
      listQuery.reload();
    } catch (err) {
      setError(
        err instanceof ApiError ? (err.details?.join(", ") ?? err.message) : tt.failed,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tt.compose}</CardTitle>
          <CardDescription>{mode === "admin" ? tt.composeDescAdmin : tt.composeDescTeacher}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "admin" && (
              <div className="space-y-1.5">
                <Label>{tt.audience}</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as AnnouncementScope)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{tt.everyone}</SelectItem>
                    <SelectItem value="GROUP">{tt.aGroup}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {needsGroup && (
              <div className="space-y-1.5">
                <Label>{tt.group}</Label>
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder={tt.selectGroup} />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name} · {g.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {groupsQuery.loading && (
                  <p className="text-xs text-theme-muted">{tt.loadingGroups}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="ann-title">{tt.titleLabel}</Label>
              <Input
                id="ann-title"
                value={title}
                maxLength={255}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tt.titlePlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ann-body">{tt.bodyLabel}</Label>
              <textarea
                id="ann-body"
                value={body}
                maxLength={4000}
                onChange={(e) => setBody(e.target.value)}
                placeholder={tt.bodyPlaceholder}
                rows={4}
                className="flex min-h-24 w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2 text-sm shadow-[var(--shadow-xs)] transition-all duration-200 placeholder:text-[var(--foreground-muted)] hover:border-[var(--ring)]/40 focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <Button type="submit" disabled={!canSubmit}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {tt.post}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tt.recent}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {listQuery.loading ? (
            <LoadingState />
          ) : listQuery.error ? (
            <ErrorState message={listQuery.error.message} onRetry={listQuery.reload} />
          ) : announcements.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-theme-muted">{tt.none}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {announcements.map((a) => (
                <li key={a.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-theme">{a.title}</p>
                      <p className="mt-0.5 whitespace-pre-line text-sm text-theme-muted">{a.body}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {a.scope === "ALL" ? tt.everyone : (a.groupName ?? tt.aGroup)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-theme-muted">
                    {a.authorName} · {formatRelative(a.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
