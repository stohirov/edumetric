"use client";

import { useRef, useState } from "react";
import { CloudUpload, Download, FileText, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/providers/locale-provider";
import { homeworkApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { HomeworkAssignmentDto } from "@/types/api/homework";
import { homeworkStatusVariant } from "./homework-status";

interface SubmissionSheetProps {
  assignment: HomeworkAssignmentDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionSheet({
  assignment,
  open,
  onOpenChange,
  onSubmitted,
}: SubmissionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100vw,30rem)] p-0">
        {assignment && (
          <SubmissionForm
            // Remount on a different assignment (or after a new submission)
            // so the form state is always derived fresh from props.
            key={`${assignment.assignmentId}-${assignment.submittedAt ?? "new"}`}
            assignment={assignment}
            onOpenChange={onOpenChange}
            onSubmitted={onSubmitted}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

interface SubmissionFormProps {
  assignment: HomeworkAssignmentDto;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

function SubmissionForm({
  assignment,
  onOpenChange,
  onSubmitted,
}: SubmissionFormProps) {
  const t = useT();
  const tt = t.pages.studentHomework;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [comment, setComment] = useState(assignment.comment ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusLabel = assignment.graded
    ? tt.statusGraded
    : assignment.submitted
      ? tt.statusSubmitted
      : assignment.overdue
        ? tt.overdue
        : tt.statusPending;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!file && comment.trim().length === 0) {
      setError(tt.errorTitle);
      return;
    }
    setSubmitting(true);
    try {
      await homeworkApi.submitHomework(assignment.assignmentId, {
        comment: comment.trim(),
        file,
      });
      onSubmitted();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : tt.errorTitle;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadExisting = async () => {
    try {
      const blob = await homeworkApi.downloadHomeworkFile(assignment.assignmentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = assignment.fileName ?? "submission";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(tt.errorTitle);
    }
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <SheetHeader className="border-b border-slate-100 p-6 text-left">
        <div className="flex items-center gap-2">
          <SheetTitle>{assignment.name}</SheetTitle>
          <Badge variant={homeworkStatusVariant(assignment)}>{statusLabel}</Badge>
        </div>
        <p className="text-sm text-slate-500">{assignment.courseName}</p>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {/* Task */}
        <div className="space-y-1.5">
          <p className="text-label">{tt.task}</p>
          <div className="rounded-[10px] border border-theme bg-slate-50/60 px-4 py-3 text-sm font-medium text-theme">
            {assignment.name}
          </div>
        </div>

        {/* Deadline + grade */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-theme-muted">{tt.deadline}: </span>
            <span className="font-medium text-theme">
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleDateString()
                : tt.noDue}
            </span>
          </div>
          {assignment.graded && (
            <div>
              <span className="text-theme-muted">{tt.score}: </span>
              <span className="font-semibold text-emerald-600">
                {assignment.gradeValue}/{assignment.maxValue}
              </span>
            </div>
          )}
        </div>

        {/* Existing submission */}
        {assignment.submitted && (
          <div className="rounded-[10px] border border-emerald-200/70 bg-emerald-50/50 px-4 py-3 text-sm">
            <p className="text-emerald-700">
              {tt.submittedOn}: {formatDateTime(assignment.submittedAt)}
            </p>
            {assignment.hasFile && (
              <button
                type="button"
                onClick={downloadExisting}
                className="mt-1.5 inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Download className="h-3.5 w-3.5" />
                {assignment.fileName ?? tt.download}
              </button>
            )}
          </div>
        )}

        {/* File upload */}
        <div className="space-y-1.5">
          <p className="text-label">{tt.file}</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload className="h-4 w-4 text-indigo-500" />
            {assignment.hasFile ? tt.replaceFile : tt.chooseFile}
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-theme-muted">
            <FileText className="h-3.5 w-3.5" />
            {file ? file.name : tt.noFileChosen}
          </p>
        </div>

        {/* Comment */}
        <div className="space-y-1.5">
          <p className="text-label">{tt.comment}</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={tt.commentPlaceholder}
            rows={5}
            className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2.5 text-sm shadow-[var(--shadow-xs)] placeholder:text-[var(--foreground-muted)] hover:border-[var(--ring)]/40 focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20"
          />
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
        <SheetClose asChild>
          <Button type="button" variant="ghost" size="sm">
            {t.common.cancel}
          </Button>
        </SheetClose>
        <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {submitting ? tt.saving : tt.save}
        </Button>
      </div>
    </form>
  );
}
