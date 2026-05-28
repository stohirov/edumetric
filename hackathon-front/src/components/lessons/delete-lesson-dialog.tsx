"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { lessonsApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { LessonDto } from "@/types/api";

interface DeleteLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonDto | null;
  onDeleted?: () => void;
}

export function DeleteLessonDialog(props: DeleteLessonDialogProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {props.lesson ? (
        <DeleteLessonDialogBody
          key={props.lesson.id}
          onOpenChange={props.onOpenChange}
          lesson={props.lesson}
          onDeleted={props.onDeleted}
        />
      ) : null}
    </Sheet>
  );
}

interface DeleteLessonDialogBodyProps {
  onOpenChange: (open: boolean) => void;
  lesson: LessonDto;
  onDeleted?: () => void;
}

function DeleteLessonDialogBody({
  onOpenChange,
  lesson,
  onDeleted,
}: DeleteLessonDialogBodyProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await lessonsApi.deleteLesson(lesson.id);
      onDeleted?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to delete lesson";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <SheetContent
      side="right"
      className="w-[min(100vw,26rem)] p-0"
      aria-describedby={undefined}
    >
      <div className="flex h-full flex-col">
        <SheetHeader className="border-b border-slate-100 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <SheetTitle>Delete lesson</SheetTitle>
              <p className="mt-1 text-sm text-slate-500">
                {lesson.topic} · {lesson.groupName}
              </p>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <p className="text-sm text-slate-600">
            This action cannot be undone. Attendance and grades tied to this
            lesson may also be affected.
          </p>
          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="sm">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={confirm}
            disabled={submitting}
          >
            {submitting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
