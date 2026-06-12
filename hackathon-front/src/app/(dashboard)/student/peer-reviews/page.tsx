"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/data-states";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { gradingApi, ApiError } from "@/lib/api";
import type { PeerReviewDto } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

interface ReviewFormProps {
  review: PeerReviewDto;
  onSubmitted: () => void;
}

function ReviewForm({ review, onSubmitted }: ReviewFormProps) {
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const trimmedScore = score.trim();
      const trimmedComments = comments.trim();
      await gradingApi.submitPeerReview(review.id, {
        score: trimmedScore === "" ? undefined : Number(trimmedScore),
        comments: trimmedComments === "" ? undefined : trimmedComments,
      });
      onSubmitted();
    } catch (e) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:max-w-xs">
        <div className="space-y-1.5">
          <Label htmlFor={`score-${review.id}`}>Score</Label>
          <Input
            id={`score-${review.id}`}
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 85"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`comments-${review.id}`}>Comments</Label>
        <textarea
          id={`comments-${review.id}`}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          placeholder="Share your feedback…"
          className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3 py-2 text-sm text-theme shadow-[var(--shadow-xs)] placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </div>
  );
}

export default function StudentPeerReviewsPage() {
  const { user } = useAuth();
  const t = useT();

  const query = useAsync(() => gradingApi.myPeerReviews(), [user?.id]);
  const reviews = query.data ?? [];

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.peerReviews}
          description="Reviews you have been assigned to complete."
        />
        <div className="space-y-6 p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState
              message={query.error.message}
              onRetry={query.reload}
            />
          ) : reviews.length === 0 ? (
            <EmptyState
              title="No peer reviews assigned"
              message="When a teacher assigns you a review, it will show up here."
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="flex-row items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle>{r.assignmentName}</CardTitle>
                      <p className="mt-0.5 text-[13px] text-theme-muted">
                        Reviewing {r.revieweeName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        r.status === "SUBMITTED" ? "success" : "secondary"
                      }
                    >
                      {r.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {r.status === "SUBMITTED" ? (
                      <div className="space-y-2 text-sm">
                        <div className="text-theme">
                          <span className="text-theme-muted">Score: </span>
                          {r.score === null ? "—" : r.score}
                        </div>
                        <div className="text-theme">
                          <span className="text-theme-muted">Comments: </span>
                          {r.comments ?? "—"}
                        </div>
                      </div>
                    ) : (
                      <ReviewForm review={r} onSubmitted={query.reload} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
