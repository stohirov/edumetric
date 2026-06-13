"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notificationPrefsApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { useAsync } from "@/lib/use-async";
import type {
  NotificationEventType,
  NotificationPreferenceDto,
} from "@/types/api";

const EVENT_LABELS: Record<NotificationEventType, string> = {
  GRADE_POSTED: "Grades posted",
  ANNOUNCEMENT: "Announcements",
  ABSENCE_MARKED: "Absence marked",
  MESSAGE_RECEIVED: "Direct messages",
  REMINDER: "Reminders",
};

export function NotificationPreferencesCard() {
  const query = useAsync(
    () => notificationPrefsApi.listNotificationPreferences(),
    [],
  );

  const [prefs, setPrefs] = useState<NotificationPreferenceDto[] | null>(null);
  const [busy, setBusy] = useState<NotificationEventType | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync the loaded list into editable local state once it arrives.
  const [syncedAt, setSyncedAt] = useState<NotificationPreferenceDto[] | null>(
    null,
  );
  if (query.data && query.data !== syncedAt) {
    setSyncedAt(query.data);
    setPrefs(query.data);
  }

  const rows = prefs ?? [];

  async function toggle(
    pref: NotificationPreferenceDto,
    field: "inApp" | "email",
    value: boolean,
  ) {
    const next: NotificationPreferenceDto = { ...pref, [field]: value };
    setBusy(pref.eventType);
    setActionError(null);
    setPrefs((prev) =>
      (prev ?? []).map((p) => (p.eventType === pref.eventType ? next : p)),
    );
    try {
      await notificationPrefsApi.updateNotificationPreference({
        eventType: next.eventType,
        inApp: next.inApp,
        email: next.email,
      });
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.message : "Failed to update preference",
      );
      query.reload();
    } finally {
      setBusy(null);
    }
  }

  const error = actionError ?? query.error?.message ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified for each kind of event. The
          account-wide in-app and email switches still act as master toggles.
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
        ) : rows.length === 0 ? (
          <p className="text-sm text-theme-muted">No notification events.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left text-xs font-medium text-theme-muted">
                  <th className="px-3 py-2">Event</th>
                  <th className="px-3 py-2">In-app</th>
                  <th className="px-3 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((pref) => (
                  <tr
                    key={pref.eventType}
                    className="border-b border-theme/60 last:border-0"
                  >
                    <td className="px-3 py-3 font-medium text-theme">
                      {EVENT_LABELS[pref.eventType]}
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        aria-label={`In-app for ${EVENT_LABELS[pref.eventType]}`}
                        className="h-4 w-4 rounded border-theme"
                        checked={pref.inApp}
                        disabled={busy !== null}
                        onChange={(e) =>
                          toggle(pref, "inApp", e.target.checked)
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Email for ${EVENT_LABELS[pref.eventType]}`}
                        className="h-4 w-4 rounded border-theme"
                        checked={pref.email}
                        disabled={busy !== null}
                        onChange={(e) =>
                          toggle(pref, "email", e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
