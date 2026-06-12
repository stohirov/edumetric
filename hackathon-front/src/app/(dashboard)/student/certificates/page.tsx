"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, ExternalLink, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { certificatesApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(
    () => certificatesApi.myCertificates(),
    [user?.id],
  );

  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const handleClaim = async () => {
    setClaiming(true);
    setClaimError(null);
    setClaimSuccess(null);
    try {
      const cert = await certificatesApi.claimCertificate();
      setClaimSuccess(`Certificate earned for ${cert.courseName}.`);
      query.reload();
    } catch (e) {
      setClaimError(errorMessage(e));
    } finally {
      setClaiming(false);
    }
  };

  const certificates = query.data ?? [];

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <div className="mx-auto max-w-[1100px] space-y-6 p-4 sm:p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-theme">
              {t.nav.certificates}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle>Earn a certificate</CardTitle>
                  <CardDescription>
                    Complete 100% of your course to earn a certificate. Once
                    you&apos;re done, claim it below.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleClaim} disabled={claiming}>
                {claiming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Claiming…
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    Claim certificate
                  </>
                )}
              </Button>

              {claimSuccess && (
                <p className="rounded-lg border border-emerald-200/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30">
                  {claimSuccess}
                </p>
              )}
              {claimError && (
                <p className="rounded-lg border border-red-200/60 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30">
                  {claimError}
                </p>
              )}
            </CardContent>
          </Card>

          {query.loading ? (
            <LoadingState label="Loading your certificates…" />
          ) : query.error ? (
            <ErrorState
              message={errorMessage(query.error)}
              onRetry={query.reload}
            />
          ) : certificates.length === 0 ? (
            <EmptyState
              title="No certificates yet"
              message="Finish a course in full and claim your certificate to see it here."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="relative overflow-hidden rounded-2xl border-2 border-indigo-200/70 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 p-6 shadow-[var(--shadow-soft)] dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-transparent dark:to-violet-950/20"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-200/30 blur-2xl dark:bg-indigo-800/20" />
                  <div className="relative flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                      <Award className="h-7 w-7" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                      Certificate of Completion
                    </p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-theme">
                      {cert.courseName}
                    </h2>
                    <p className="mt-1 text-sm text-theme-muted">
                      Awarded to{" "}
                      <span className="font-medium text-theme">
                        {cert.studentName}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-theme-muted">
                      Completed {formatDate(cert.completedAt)}
                    </p>

                    <div className="mt-5 w-full border-t border-indigo-200/50 pt-4 dark:border-indigo-900/40">
                      <p className="text-[11px] uppercase tracking-wider text-theme-muted">
                        Certificate code
                      </p>
                      <p className="mt-1 break-all font-mono text-sm text-theme">
                        {cert.certificateCode}
                      </p>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Link
                        href={`/verify?code=${encodeURIComponent(cert.certificateCode)}`}
                      >
                        Verify
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
