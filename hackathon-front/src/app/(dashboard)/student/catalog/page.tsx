"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState, EmptyState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { catalogApi, ApiError } from "@/lib/api";
import type {
  CatalogItemDto,
  EnrollmentRequestDto,
  EnrollmentRequestStatus,
} from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_VARIANT: Record<
  EnrollmentRequestStatus,
  "secondary" | "success" | "destructive"
> = {
  PENDING: "secondary",
  APPROVED: "success",
  REJECTED: "destructive",
};

function OfferingCard({
  item,
  onRequested,
}: {
  item: CatalogItemDto;
  onRequested: () => void;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackKind, setFeedbackKind] = useState<"success" | "error">("success");

  async function handleRequest() {
    setSubmitting(true);
    setFeedback(null);
    try {
      await catalogApi.requestEnrollment({
        groupId: item.groupId,
        message: message.trim() === "" ? undefined : message.trim(),
      });
      setFeedbackKind("success");
      setFeedback("Enrollment requested.");
      setMessage("");
      onRequested();
    } catch (e) {
      setFeedbackKind("error");
      setFeedback(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{item.courseName}</CardTitle>
        <CardDescription>{item.groupName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {item.courseDescription && (
          <p className="text-sm text-theme-muted">{item.courseDescription}</p>
        )}
        <p className="text-xs text-theme-muted">
          {formatDate(item.startDate)} – {formatDate(item.endDate)}
        </p>
        <div className="mt-auto space-y-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message (why you'd like to join)"
            disabled={submitting}
          />
          <Button
            size="sm"
            className="w-full"
            onClick={handleRequest}
            disabled={submitting}
          >
            <Send className="h-4 w-4" />
            Request enrollment
          </Button>
          {feedback && (
            <p
              className={
                feedbackKind === "error"
                  ? "text-xs text-red-500"
                  : "text-xs text-emerald-600"
              }
            >
              {feedback}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MyRequestsCard({
  requests,
  loading,
}: {
  requests: EnrollmentRequestDto[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My requests</CardTitle>
        <CardDescription>
          Track the status of your enrollment requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState label="Loading your requests…" className="min-h-[20vh]" />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            message="Request enrollment from the catalog above to get started."
          />
        ) : (
          <ul className="divide-y divide-theme">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-theme">
                    {req.courseName}
                  </p>
                  <p className="truncate text-xs text-theme-muted">
                    {req.groupName} · Requested {formatDate(req.createdAt)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[req.status]}>{req.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentCatalogPage() {
  const { user } = useAuth();
  const t = useT();

  const catalogQuery = useAsync(() => catalogApi.listCatalog(), [user?.id]);
  const requestsQuery = useAsync(() => catalogApi.myRequests(), [user?.id]);

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.catalog}
          description="Browse available course offerings and request enrollment."
        />
        <div className="space-y-8 p-8">
          {catalogQuery.loading ? (
            <LoadingState label="Loading catalog…" />
          ) : catalogQuery.error ? (
            <ErrorState
              message={catalogQuery.error.message}
              onRetry={catalogQuery.reload}
            />
          ) : (catalogQuery.data ?? []).length === 0 ? (
            <EmptyState
              title="No offerings available"
              message="There are no course offerings open for enrollment right now."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(catalogQuery.data ?? []).map((item) => (
                <OfferingCard
                  key={item.groupId}
                  item={item}
                  onRequested={requestsQuery.reload}
                />
              ))}
            </div>
          )}

          {requestsQuery.error ? (
            <ErrorState
              title="Couldn’t load your requests"
              message={requestsQuery.error.message}
              onRetry={requestsQuery.reload}
            />
          ) : (
            <MyRequestsCard
              requests={requestsQuery.data ?? []}
              loading={requestsQuery.loading}
            />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
