"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { attendanceApi, ApiError } from "@/lib/api";

function toMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

export default function AdminAttendancePolicyPage() {
  const { user } = useAuth();
  const t = useT();

  const policyQuery = useAsync(() => attendanceApi.getPolicy(), [user?.id]);

  const [minAttendancePercent, setMinAttendancePercent] = useState("");
  const [consecutiveAbsenceLimit, setConsecutiveAbsenceLimit] = useState("");
  const [notifyOnAbsence, setNotifyOnAbsence] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Render-time sync of the form to the loaded policy (runs once when data arrives) —
  // the React "store information from previous renders" pattern.
  const [synced, setSynced] = useState(false);
  if (policyQuery.data && !synced) {
    setSynced(true);
    setMinAttendancePercent(String(policyQuery.data.minAttendancePercent));
    setConsecutiveAbsenceLimit(String(policyQuery.data.consecutiveAbsenceLimit));
    setNotifyOnAbsence(policyQuery.data.notifyOnAbsence);
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await attendanceApi.updatePolicy({
        minAttendancePercent: Number(minAttendancePercent),
        consecutiveAbsenceLimit: Number(consecutiveAbsenceLimit),
        notifyOnAbsence,
      });
      setSuccess(true);
      policyQuery.reload();
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.attendancePolicy}
          description="Configure the institution-wide attendance policy."
        />
        <div className="space-y-6 p-8">
          {policyQuery.loading ? (
            <LoadingState />
          ) : policyQuery.error ? (
            <ErrorState
              message={policyQuery.error.message}
              onRetry={policyQuery.reload}
            />
          ) : (
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Attendance policy</CardTitle>
                <CardDescription>
                  The minimum attendance percentage drives the &ldquo;at
                  risk&rdquo; flag shown in attendance reports — any student
                  below it is marked at risk. Notify on absence toggles whether
                  absence notifications are sent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-attendance">
                      Minimum attendance percent
                    </Label>
                    <Input
                      id="min-attendance"
                      type="number"
                      min={0}
                      max={100}
                      value={minAttendancePercent}
                      onChange={(e) => setMinAttendancePercent(e.target.value)}
                    />
                    <p className="text-xs text-theme-muted">
                      Students below this percentage are flagged as at risk.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consecutive-absence">
                      Consecutive absence limit
                    </Label>
                    <Input
                      id="consecutive-absence"
                      type="number"
                      min={0}
                      value={consecutiveAbsenceLimit}
                      onChange={(e) =>
                        setConsecutiveAbsenceLimit(e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="notify-absence"
                      type="checkbox"
                      className="h-4 w-4 rounded border-theme"
                      checked={notifyOnAbsence}
                      onChange={(e) => setNotifyOnAbsence(e.target.checked)}
                    />
                    <Label htmlFor="notify-absence">Notify on absence</Label>
                  </div>
                  <p className="text-xs text-theme-muted">
                    When enabled, absence notifications are sent to the relevant
                    recipients.
                  </p>

                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {success && (
                    <p className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Policy saved.
                    </p>
                  )}

                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save policy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
