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
import { atRiskRulesApi, ApiError } from "@/lib/api";

function toMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

export default function AdminAtRiskRulesPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.adminAtRiskRules;
  const fallbackError = t.pages.studentContent.error;

  const rulesQuery = useAsync(() => atRiskRulesApi.getAtRiskRules(), [user?.id]);

  const [compositeThreshold, setCompositeThreshold] = useState("");
  const [attendanceThreshold, setAttendanceThreshold] = useState("");
  const [compositeEnabled, setCompositeEnabled] = useState(false);
  const [attendanceEnabled, setAttendanceEnabled] = useState(false);
  const [flagLowConfidence, setFlagLowConfidence] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Render-time sync of the form to the loaded rules (runs once when data arrives).
  const [synced, setSynced] = useState(false);
  if (rulesQuery.data && !synced) {
    setSynced(true);
    setCompositeThreshold(String(rulesQuery.data.compositeThreshold));
    setAttendanceThreshold(String(rulesQuery.data.attendanceThreshold));
    setCompositeEnabled(rulesQuery.data.compositeEnabled);
    setAttendanceEnabled(rulesQuery.data.attendanceEnabled);
    setFlagLowConfidence(rulesQuery.data.flagLowConfidence);
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await atRiskRulesApi.updateAtRiskRules({
        compositeThreshold: Number(compositeThreshold),
        attendanceThreshold: Number(attendanceThreshold),
        compositeEnabled,
        attendanceEnabled,
        flagLowConfidence,
      });
      setSuccess(true);
      rulesQuery.reload();
    } catch (err) {
      setError(toMessage(err, fallbackError));
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
          title={tt.title}
          description={tt.desc}
        />
        <div className="space-y-6 p-8">
          {rulesQuery.loading ? (
            <LoadingState />
          ) : rulesQuery.error ? (
            <ErrorState
              message={rulesQuery.error.message}
              onRetry={rulesQuery.reload}
            />
          ) : (
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>{tt.card}</CardTitle>
                <CardDescription>
                  {tt.cardDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="composite-enabled"
                        type="checkbox"
                        className="h-4 w-4 rounded border-theme"
                        checked={compositeEnabled}
                        onChange={(e) => setCompositeEnabled(e.target.checked)}
                      />
                      <Label htmlFor="composite-enabled">
                        {tt.flagComposite}
                      </Label>
                    </div>
                    <Label htmlFor="composite-threshold">
                      {tt.compositeThreshold}
                    </Label>
                    <Input
                      id="composite-threshold"
                      type="number"
                      min={0}
                      max={100}
                      value={compositeThreshold}
                      onChange={(e) => setCompositeThreshold(e.target.value)}
                    />
                    <p className="text-xs text-theme-muted">
                      {tt.compositeHint}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="attendance-enabled"
                        type="checkbox"
                        className="h-4 w-4 rounded border-theme"
                        checked={attendanceEnabled}
                        onChange={(e) => setAttendanceEnabled(e.target.checked)}
                      />
                      <Label htmlFor="attendance-enabled">
                        {tt.flagAttendance}
                      </Label>
                    </div>
                    <Label htmlFor="attendance-threshold">
                      {tt.attendanceThreshold}
                    </Label>
                    <Input
                      id="attendance-threshold"
                      type="number"
                      min={0}
                      max={100}
                      value={attendanceThreshold}
                      onChange={(e) => setAttendanceThreshold(e.target.value)}
                    />
                    <p className="text-xs text-theme-muted">
                      {tt.attendanceHint}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="flag-low-confidence"
                      type="checkbox"
                      className="h-4 w-4 rounded border-theme"
                      checked={flagLowConfidence}
                      onChange={(e) => setFlagLowConfidence(e.target.checked)}
                    />
                    <Label htmlFor="flag-low-confidence">
                      {tt.flagLowData}
                    </Label>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {success && (
                    <p className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {tt.saved}
                    </p>
                  )}

                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? tt.saving : tt.saveBtn}
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
