"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { quizzesApi, teachersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type {
  QuestionRequest,
  QuestionType,
  QuizDto,
} from "@/types/api/quizzes";

const QUESTION_TYPES: QuestionType[] = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_ANSWER",
];

interface CourseOption {
  courseId: number;
  courseName: string;
}

function errMsg(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

export default function TeacherQuizzesPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.teacherQuizzes;

  const groupsQuery = useAsync(() => teachersApi.listMyGroups(), [user?.id]);

  const courses = useMemo<CourseOption[]>(() => {
    const byId = new Map<number, CourseOption>();
    for (const g of groupsQuery.data ?? []) {
      if (!byId.has(g.courseId)) {
        byId.set(g.courseId, { courseId: g.courseId, courseName: g.courseName });
      }
    }
    return [...byId.values()];
  }, [groupsQuery.data]);

  const [courseId, setCourseId] = useState<number | null>(null);
  const activeCourseId = courseId ?? courses[0]?.courseId ?? null;

  const [selected, setSelected] = useState<QuizDto | null>(null);

  const quizzesQuery = useAsync(
    () =>
      activeCourseId == null
        ? Promise.resolve<QuizDto[]>([])
        : quizzesApi.listByCourse(activeCourseId),
    [activeCourseId],
  );

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="p-8">
          {groupsQuery.loading ? (
            <LoadingState />
          ) : groupsQuery.error ? (
            <ErrorState
              message={groupsQuery.error.message}
              onRetry={groupsQuery.reload}
            />
          ) : courses.length === 0 ? (
            <p className="text-sm text-theme-muted">{tt.noCourses}</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="space-y-6">
                <div className="max-w-xs">
                  <Label className="mb-1.5 block">{tt.selectCourse}</Label>
                  <Select
                    value={activeCourseId != null ? String(activeCourseId) : ""}
                    onValueChange={(v) => {
                      setCourseId(Number(v));
                      setSelected(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tt.selectCourse} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.courseId} value={String(c.courseId)}>
                          {c.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{tt.quizzes}</CardTitle>
                    <CardDescription>{tt.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quizzesQuery.loading ? (
                      <LoadingState />
                    ) : quizzesQuery.error ? (
                      <ErrorState
                        message={quizzesQuery.error.message}
                        onRetry={quizzesQuery.reload}
                      />
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {(quizzesQuery.data ?? []).map((q) => (
                          <QuizRow
                            key={q.id}
                            quiz={q}
                            selected={selected?.id === q.id}
                            onSelect={() => setSelected(q)}
                            onChanged={quizzesQuery.reload}
                          />
                        ))}
                        {(quizzesQuery.data ?? []).length === 0 && (
                          <li className="py-6 text-center text-sm text-theme-muted">
                            {tt.noQuizzes}
                          </li>
                        )}
                      </ul>
                    )}

                    {activeCourseId != null && (
                      <NewQuizForm
                        courseId={activeCourseId}
                        onCreated={quizzesQuery.reload}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              <QuestionBuilder quiz={selected} />
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

function QuizRow({
  quiz,
  selected,
  onSelect,
  onChanged,
}: {
  quiz: QuizDto;
  selected: boolean;
  onSelect: () => void;
  onChanged: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherQuizzes;
  const [busy, setBusy] = useState(false);

  const remove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(tt.confirmDelete)) return;
    setBusy(true);
    try {
      await quizzesApi.deleteQuiz(quiz.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-slate-50/60 ${
          selected ? "bg-indigo-50/70" : ""
        }`}
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-theme">{quiz.title}</p>
          <p className="mt-0.5 text-xs text-theme-muted">
            {quiz.questionCount} {tt.questionCount} · {quiz.totalPoints} {tt.points}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={quiz.published ? "secondary" : "outline"}>
            {quiz.published ? tt.published : tt.draft}
          </Badge>
          <span
            role="button"
            tabIndex={0}
            onClick={remove}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") remove(ev as unknown as React.MouseEvent);
            }}
            className="inline-flex items-center text-rose-500 hover:text-rose-600"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </span>
        </div>
      </button>
    </li>
  );
}

function NewQuizForm({
  courseId,
  onCreated,
}: {
  courseId: number;
  onCreated: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherQuizzes;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("");
  const [passScore, setPassScore] = useState("");
  const [published, setPublished] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError(tt.error);
      return;
    }
    setBusy(true);
    try {
      await quizzesApi.createQuiz({
        courseId,
        title: title.trim(),
        description: description.trim() || null,
        timeLimitMinutes: timeLimit ? Number(timeLimit) : null,
        maxAttempts: maxAttempts ? Number(maxAttempts) : null,
        passScore: passScore ? Number(passScore) : null,
        published,
        shuffleQuestions: shuffle,
      });
      setTitle("");
      setDescription("");
      setTimeLimit("");
      setMaxAttempts("");
      setPassScore("");
      setPublished(false);
      setShuffle(false);
      onCreated();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-[10px] border border-theme bg-slate-50/50 p-4"
    >
      <p className="text-label">{tt.newQuiz}</p>
      <div className="space-y-1.5">
        <Label htmlFor="quiz-title">{tt.quizTitle}</Label>
        <Input
          id="quiz-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quiz-desc">{tt.description}</Label>
        <Input
          id="quiz-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="quiz-time">{tt.timeLimit}</Label>
          <Input
            id="quiz-time"
            type="number"
            min={1}
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quiz-attempts">{tt.maxAttempts}</Label>
          <Input
            id="quiz-attempts"
            type="number"
            min={1}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quiz-pass">{tt.passScore}</Label>
          <Input
            id="quiz-pass"
            type="number"
            min={0}
            max={100}
            value={passScore}
            onChange={(e) => setPassScore(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-theme">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          {tt.published}
        </label>
        <label className="flex items-center gap-2 text-sm text-theme">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
          />
          {tt.shuffle}
        </label>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {busy ? tt.creating : tt.create}
      </Button>
    </form>
  );
}

interface DraftOption {
  text: string;
  correct: boolean;
}

interface DraftQuestion {
  text: string;
  type: QuestionType;
  points: string;
  options: DraftOption[];
}

function QuestionBuilder({ quiz }: { quiz: QuizDto | null }) {
  const t = useT();
  const tt = t.pages.teacherQuizzes;

  const detailQuery = useAsync(
    () =>
      quiz == null
        ? Promise.resolve(null)
        : quizzesApi.getQuiz(quiz.id),
    [quiz?.id],
  );

  if (!quiz) {
    return (
      <Card>
        <CardContent className="flex min-h-[12rem] items-center justify-center text-sm text-theme-muted">
          {tt.selectQuizPrompt}
        </CardContent>
      </Card>
    );
  }

  if (detailQuery.loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (detailQuery.error) {
    return (
      <Card>
        <CardContent className="py-8">
          <ErrorState
            message={detailQuery.error.message}
            onRetry={detailQuery.reload}
          />
        </CardContent>
      </Card>
    );
  }

  const detail = detailQuery.data;
  if (!detail) return null;

  const initial: DraftQuestion[] = detail.questions.map((q) => ({
    text: q.text,
    type: q.type,
    points: String(q.points),
    options:
      q.type === "SHORT_ANSWER"
        ? q.options.map((o) => ({ text: o.text, correct: true }))
        : q.options.map((o) => ({ text: o.text, correct: o.correct })),
  }));

  return (
    <QuestionEditor
      key={`${quiz.id}-${detail.questions.length}`}
      quizId={quiz.id}
      quizTitle={detail.title}
      initial={initial}
      onSaved={detailQuery.reload}
    />
  );
}

function emptyOption(): DraftOption {
  return { text: "", correct: false };
}

function newQuestion(type: QuestionType): DraftQuestion {
  if (type === "TRUE_FALSE") {
    return {
      text: "",
      type,
      points: "1",
      options: [
        { text: "True", correct: true },
        { text: "False", correct: false },
      ],
    };
  }
  if (type === "SHORT_ANSWER") {
    return { text: "", type, points: "1", options: [{ text: "", correct: true }] };
  }
  return {
    text: "",
    type,
    points: "1",
    options: [emptyOption(), emptyOption()],
  };
}

function QuestionEditor({
  quizId,
  quizTitle,
  initial,
  onSaved,
}: {
  quizId: number;
  quizTitle: string;
  initial: DraftQuestion[];
  onSaved: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherQuizzes;

  const [questions, setQuestions] = useState<DraftQuestion[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (i: number, patch: Partial<DraftQuestion>) => {
    setQuestions((qs) =>
      qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)),
    );
  };

  const changeType = (i: number, type: QuestionType) => {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === i ? { ...newQuestion(type), text: q.text, points: q.points } : q,
      ),
    );
  };

  const updateOption = (qi: number, oi: number, patch: Partial<DraftOption>) => {
    setQuestions((qs) =>
      qs.map((q, idx) => {
        if (idx !== qi) return q;
        let options = q.options.map((o, j) =>
          j === oi ? { ...o, ...patch } : o,
        );
        // single-correct enforcement for radio types
        if (
          patch.correct === true &&
          (q.type === "SINGLE_CHOICE" || q.type === "TRUE_FALSE")
        ) {
          options = options.map((o, j) => ({ ...o, correct: j === oi }));
        }
        return { ...q, options };
      }),
    );
  };

  const addOption = (qi: number) => {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi ? { ...q, options: [...q.options, emptyOption()] } : q,
      ),
    );
  };

  const removeOption = (qi: number, oi: number) => {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.filter((_, j) => j !== oi) }
          : q,
      ),
    );
  };

  const removeQuestion = (qi: number) => {
    setQuestions((qs) => qs.filter((_, idx) => idx !== qi));
  };

  const save = async () => {
    setError(null);
    const payload: QuestionRequest[] = questions.map((q) => ({
      text: q.text.trim(),
      type: q.type,
      points: q.points ? Number(q.points) : null,
      options:
        q.type === "SHORT_ANSWER"
          ? q.options
              .filter((o) => o.text.trim())
              .map((o) => ({ text: o.text.trim(), correct: true }))
          : q.options
              .filter((o) => o.text.trim())
              .map((o) => ({ text: o.text.trim(), correct: o.correct })),
    }));
    setBusy(true);
    try {
      await quizzesApi.replaceQuestions(quizId, { questions: payload });
      onSaved();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tt.questions}</CardTitle>
        <CardDescription>{quizTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 && (
          <p className="text-sm text-theme-muted">{tt.noQuestions}</p>
        )}

        {questions.map((q, qi) => (
          <div
            key={qi}
            className="space-y-3 rounded-[10px] border border-theme p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-label">
                {tt.questions} {qi + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(qi)}
                className="text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label>{tt.questionText}</Label>
              <Input
                value={q.text}
                onChange={(e) => update(qi, { text: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tt.questionType}</Label>
                <Select
                  value={q.type}
                  onValueChange={(v) => changeType(qi, v as QuestionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((qt) => (
                      <SelectItem key={qt} value={qt}>
                        {tt.types[qt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{tt.points}</Label>
                <Input
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) => update(qi, { points: e.target.value })}
                />
              </div>
            </div>

            {q.type === "SHORT_ANSWER" ? (
              <div className="space-y-2">
                <Label>{tt.acceptedAnswers}</Label>
                {q.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <Input
                      value={o.text}
                      onChange={(e) =>
                        updateOption(qi, oi, { text: e.target.value })
                      }
                      placeholder={tt.optionText}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(qi, oi)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(qi)}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {tt.addAnswer}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{tt.options}</Label>
                {q.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type={
                        q.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"
                      }
                      name={`q-${qi}-correct`}
                      checked={o.correct}
                      onChange={(e) =>
                        updateOption(qi, oi, { correct: e.target.checked })
                      }
                    />
                    <Input
                      value={o.text}
                      onChange={(e) =>
                        updateOption(qi, oi, { text: e.target.value })
                      }
                      placeholder={tt.optionText}
                      disabled={q.type === "TRUE_FALSE"}
                    />
                    {q.type !== "TRUE_FALSE" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(qi, oi)}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                {q.type !== "TRUE_FALSE" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(qi)}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {tt.addOption}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setQuestions((qs) => [...qs, newQuestion("SINGLE_CHOICE")])
            }
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {tt.addQuestion}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={save}
            className="gap-1.5"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? tt.saving : tt.saveQuestions}
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
