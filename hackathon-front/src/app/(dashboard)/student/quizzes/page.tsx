"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { quizzesApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type {
  AnswerSubmission,
  AttemptResultDto,
  StudentQuizDto,
  TakeQuestionDto,
  TakeQuizDto,
} from "@/types/api/quizzes";

function errMsg(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

export default function StudentQuizzesPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.studentQuizzes;

  const query = useAsync(() => quizzesApi.getMyQuizzes(), [user?.id]);

  const [active, setActive] = useState<StudentQuizDto | null>(null);
  const [open, setOpen] = useState(false);

  const items = query.data ?? [];

  const attemptsLeft = (q: StudentQuizDto) =>
    q.maxAttempts == null || q.attemptsUsed < q.maxAttempts;

  const startQuiz = (q: StudentQuizDto) => {
    setActive(q);
    setOpen(true);
  };

  return (
    <RouteGuard allow={["STUDENT"]}>
      <DashboardShell
        role="student"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="p-8">
          {query.loading ? (
            <LoadingState />
          ) : query.error ? (
            <ErrorState message={query.error.message} onRetry={query.reload} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{tt.title}</CardTitle>
                <CardDescription>{tt.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-100">
                  {items.map((q) => (
                    <li
                      key={q.id}
                      className="flex items-start justify-between gap-3 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium text-theme">
                          <span className="truncate">{q.title}</span>
                          {q.lastPassed != null && (
                            <Badge
                              variant={q.lastPassed ? "secondary" : "outline"}
                            >
                              {q.lastPassed ? tt.passed : tt.failed}
                            </Badge>
                          )}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-theme-muted">
                          <span>
                            {q.questionCount} {tt.questionCount}
                          </span>
                          <span>
                            {tt.attempts}: {q.attemptsUsed}
                            {q.maxAttempts != null ? `/${q.maxAttempts}` : ""}
                          </span>
                          {q.bestScore != null && (
                            <span>
                              {tt.bestScore}: {q.bestScore}/{q.totalPoints}
                            </span>
                          )}
                          {q.timeLimitMinutes != null && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {q.timeLimitMinutes} {tt.minutes}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!attemptsLeft(q)}
                        onClick={() => startQuiz(q)}
                        className="shrink-0"
                      >
                        {!attemptsLeft(q)
                          ? tt.noAttemptsLeft
                          : q.attemptsUsed > 0
                            ? tt.retake
                            : tt.start}
                      </Button>
                    </li>
                  ))}
                  {items.length === 0 && (
                    <li className="py-10 text-center text-sm text-theme-muted">
                      {tt.noQuizzes}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <Sheet
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) query.reload();
          }}
        >
          <SheetContent side="right" className="w-[min(100vw,34rem)] p-0">
            {active && (
              <TakeQuiz
                key={active.id}
                quizId={active.id}
                onClose={() => setOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </DashboardShell>
    </RouteGuard>
  );
}

function TakeQuiz({
  quizId,
  onClose,
}: {
  quizId: number;
  onClose: () => void;
}) {
  const t = useT();
  const tt = t.pages.studentQuizzes;

  const query = useAsync(() => quizzesApi.getQuizToTake(quizId), [quizId]);

  const [answers, setAnswers] = useState<Record<number, AnswerSubmission>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResultDto | null>(null);

  const setSelected = (q: TakeQuestionDto, optionId: number) => {
    setAnswers((prev) => {
      const current = prev[q.id]?.selectedOptionIds ?? [];
      let next: number[];
      if (q.type === "MULTIPLE_CHOICE") {
        next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        next = [optionId];
      }
      return {
        ...prev,
        [q.id]: { questionId: q.id, selectedOptionIds: next },
      };
    });
  };

  const setText = (q: TakeQuestionDto, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: { questionId: q.id, textAnswer: value },
    }));
  };

  const submit = async (quiz: TakeQuizDto) => {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        answers: quiz.questions.map(
          (q): AnswerSubmission =>
            answers[q.id] ?? { questionId: q.id, selectedOptionIds: [] },
        ),
      };
      const res = await quizzesApi.submitAttempt(quizId, payload);
      setResult(res);
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setSubmitting(false);
    }
  };

  if (query.loading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }
  if (query.error) {
    return (
      <div className="p-6">
        <ErrorState message={query.error.message} onRetry={query.reload} />
      </div>
    );
  }
  const quiz = query.data;
  if (!quiz) return null;

  if (result) {
    const byQuestion = new Map(result.results.map((r) => [r.questionId, r]));
    return (
      <div className="flex h-full flex-col">
        <SheetHeader className="border-b border-slate-100 p-6 text-left">
          <div className="flex items-center gap-2">
            <SheetTitle>{tt.result}</SheetTitle>
            {result.passed != null && (
              <Badge variant={result.passed ? "secondary" : "outline"}>
                {result.passed ? tt.passed : tt.failed}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {tt.score}: {result.score}/{result.maxScore}
          </p>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {quiz.questions.map((q, i) => {
            const r = byQuestion.get(q.id);
            return (
              <div
                key={q.id}
                className="rounded-[10px] border border-theme p-3 text-sm"
              >
                <p className="flex items-start gap-2 font-medium text-theme">
                  {r?.correct ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  )}
                  <span>
                    {i + 1}. {q.text}
                  </span>
                </p>
                {r && (
                  <p className="mt-1 pl-6 text-xs text-theme-muted">
                    {r.awardedPoints}/{r.maxPoints} {tt.score}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 p-4">
          <Button type="button" size="sm" onClick={onClose}>
            {tt.close}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b border-slate-100 p-6 text-left">
        <SheetTitle>{quiz.title}</SheetTitle>
        {quiz.description && (
          <p className="text-sm text-slate-500">{quiz.description}</p>
        )}
      </SheetHeader>
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <p className="font-medium text-theme">
              {i + 1}. {q.text}{" "}
              <span className="text-xs text-theme-muted">
                ({q.points} {tt.score})
              </span>
            </p>
            {q.type === "SHORT_ANSWER" ? (
              <input
                type="text"
                value={answers[q.id]?.textAnswer ?? ""}
                onChange={(e) => setText(q, e.target.value)}
                className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2 text-sm shadow-[var(--shadow-xs)] focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20"
              />
            ) : (
              <div className="space-y-1.5">
                {q.options.map((o) => {
                  const selected =
                    answers[q.id]?.selectedOptionIds?.includes(o.id) ?? false;
                  return (
                    <label
                      key={o.id}
                      className="flex items-center gap-2 rounded-[10px] border border-theme px-3 py-2 text-sm text-theme"
                    >
                      <input
                        type={
                          q.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"
                        }
                        name={`take-q-${q.id}`}
                        checked={selected}
                        onChange={() => setSelected(q, o.id)}
                      />
                      {o.text}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
        {error && (
          <p className="mr-auto text-xs text-rose-600">{error}</p>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {tt.close}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={submitting}
          onClick={() => submit(quiz)}
          className="gap-1.5"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {submitting ? tt.submitting : tt.submit}
        </Button>
      </div>
    </div>
  );
}
