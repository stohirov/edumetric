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
import type { Dictionary } from "@/lib/i18n/types";

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
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
  tt,
  fallbackError,
}: {
  item: CatalogItemDto;
  onRequested: () => void;
  tt: Dictionary["pages"]["studentCatalogPage"];
  fallbackError: string;
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
      setFeedback(tt.requested);
      setMessage("");
      onRequested();
    } catch (e) {
      setFeedbackKind("error");
      setFeedback(errorMessage(e, fallbackError));
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
            placeholder={tt.optionalMessage}
            disabled={submitting}
          />
          <Button
            size="sm"
            className="w-full"
            onClick={handleRequest}
            disabled={submitting}
          >
            <Send className="h-4 w-4" />
            {tt.requestEnrollment}
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
  tt,
}: {
  requests: EnrollmentRequestDto[];
  loading: boolean;
  tt: Dictionary["pages"]["studentCatalogPage"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tt.myRequests}</CardTitle>
        <CardDescription>
          {tt.myRequestsDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState label={tt.loadingRequests} className="min-h-[20vh]" />
        ) : requests.length === 0 ? (
          <EmptyState
            title={tt.noRequests}
            message={tt.noRequestsMsg}
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
                    {req.groupName} · {tt.requestedOn} {formatDate(req.createdAt)}
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
  const tt = t.pages.studentCatalogPage;
  const fallbackError = t.pages.studentContent.error;

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
          description={tt.desc}
        />
        <div className="space-y-8 p-8">
          {catalogQuery.loading ? (
            <LoadingState label={tt.loadingCatalog} />
          ) : catalogQuery.error ? (
            <ErrorState
              message={catalogQuery.error.message}
              onRetry={catalogQuery.reload}
            />
          ) : (catalogQuery.data ?? []).length === 0 ? (
            <EmptyState
              title={tt.noOfferings}
              message={tt.noOfferingsMsg}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(catalogQuery.data ?? []).map((item) => (
                <OfferingCard
                  key={item.groupId}
                  item={item}
                  onRequested={requestsQuery.reload}
                  tt={tt}
                  fallbackError={fallbackError}
                />
              ))}
            </div>
          )}

          {requestsQuery.error ? (
            <ErrorState
              title={tt.loadRequestsError}
              message={requestsQuery.error.message}
              onRetry={requestsQuery.reload}
            />
          ) : (
            <MyRequestsCard
              requests={requestsQuery.data ?? []}
              loading={requestsQuery.loading}
              tt={tt}
            />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
