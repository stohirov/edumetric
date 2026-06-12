"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState, EmptyState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { catalogApi, ApiError } from "@/lib/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminEnrollmentRequestsPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(() => catalogApi.pendingRequests(), [user?.id]);

  const [pendingId, setPendingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackKind, setFeedbackKind] = useState<"success" | "error">("success");

  async function handleDecision(id: number, action: "approve" | "reject") {
    setPendingId(id);
    setFeedback(null);
    try {
      if (action === "approve") {
        await catalogApi.approveRequest(id);
        setFeedback("Request approved.");
      } else {
        await catalogApi.rejectRequest(id);
        setFeedback("Request rejected.");
      }
      setFeedbackKind("success");
      query.reload();
    } catch (e) {
      setFeedbackKind("error");
      setFeedback(errorMessage(e));
    } finally {
      setPendingId(null);
    }
  }

  const requests = query.data ?? [];

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.enrollmentRequests}
          description="Review and decide on pending student enrollment requests."
        />
        <div className="space-y-6 p-8">
          {feedback && (
            <p
              className={
                feedbackKind === "error"
                  ? "text-sm text-red-500"
                  : "text-sm text-emerald-600"
              }
            >
              {feedback}
            </p>
          )}

          {query.loading ? (
            <LoadingState label="Loading requests…" />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : requests.length === 0 ? (
            <EmptyState
              title="No pending requests"
              message="There are no enrollment requests awaiting a decision."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-theme text-left text-xs uppercase tracking-wide text-theme-muted">
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Course</th>
                        <th className="px-4 py-3 font-medium">Group</th>
                        <th className="px-4 py-3 font-medium">Message</th>
                        <th className="px-4 py-3 font-medium">Requested at</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme">
                      {requests.map((req) => {
                        const busy = pendingId === req.id;
                        return (
                          <tr key={req.id} className="text-theme">
                            <td className="px-4 py-3 font-medium">
                              {req.studentName}
                            </td>
                            <td className="px-4 py-3">{req.courseName}</td>
                            <td className="px-4 py-3">{req.groupName}</td>
                            <td className="max-w-xs px-4 py-3 text-theme-muted">
                              {req.message ?? "—"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-theme-muted">
                              {formatDateTime(req.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleDecision(req.id, "approve")}
                                  disabled={busy}
                                >
                                  <Check className="h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDecision(req.id, "reject")}
                                  disabled={busy}
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
