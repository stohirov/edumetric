"use client";

import { Suspense, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
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
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { attendanceApi, ApiError } from "@/lib/api";

function errMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function CheckinForm() {
  const prefill = useSearchParams().get("code") ?? "";
  const [code, setCode] = useState(prefill.toUpperCase());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const value = code.trim().toUpperCase();
    if (!value) {
      setError("Enter the check-in code shown by your teacher.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await attendanceApi.submitCheckin({ code: value });
      setDone(true);
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <h2 className="text-lg font-semibold text-emerald-700">
            You&apos;re marked present
          </h2>
          <p className="text-sm text-theme-muted">
            Your attendance has been recorded for this lesson.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Check in</CardTitle>
        <CardDescription>
          Enter the code your teacher is showing to mark yourself present.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="checkin-code">Check-in code</Label>
          <Input
            id="checkin-code"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            className="text-center font-mono text-lg tracking-[0.25em] uppercase"
          />
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={busy}
          onClick={submit}
        >
          {busy ? "Checking in…" : "Check in"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function StudentCheckinPage() {
  const { user } = useAuth();
  const t = useT();

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.checkin}
          description="Mark yourself present using the code from your teacher."
        />
        <div className="flex justify-center p-8">
          <Suspense fallback={null}>
            <CheckinForm />
          </Suspense>
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
