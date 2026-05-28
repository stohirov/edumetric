"use client";

import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { coursesApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { CourseDto, UpdateCourseRequest } from "@/types/api";

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseDto | null;
  onUpdated?: () => void;
}

interface FormState {
  name: string;
  code: string;
  description: string;
}

export function EditCourseDialog(props: EditCourseDialogProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {props.course ? (
        <EditCourseDialogBody
          key={props.course.id}
          onOpenChange={props.onOpenChange}
          course={props.course}
          onUpdated={props.onUpdated}
        />
      ) : null}
    </Sheet>
  );
}

interface EditCourseDialogBodyProps {
  onOpenChange: (open: boolean) => void;
  course: CourseDto;
  onUpdated?: () => void;
}

function EditCourseDialogBody({
  onOpenChange,
  course,
  onUpdated,
}: EditCourseDialogBodyProps) {
  const [form, setForm] = useState<FormState>(() => ({
    name: course.name,
    code: course.code,
    description: course.description ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.code.trim()) {
      setError("Name and code are required");
      return;
    }
    const payload: UpdateCourseRequest = {};
    if (form.name.trim() !== course.name) payload.name = form.name.trim();
    if (form.code.trim() !== course.code) payload.code = form.code.trim();
    if (form.description.trim() !== (course.description ?? "")) {
      payload.description = form.description.trim();
    }
    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }
    setSubmitting(true);
    try {
      await coursesApi.updateCourse(course.id, payload);
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to update course";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SheetContent
      side="right"
      className="w-[min(100vw,28rem)] p-0"
      aria-describedby={undefined}
    >
      <form onSubmit={submit} className="flex h-full flex-col">
        <SheetHeader className="border-b border-slate-100 p-6">
          <SheetTitle>Edit course</SheetTitle>
          <p className="text-sm text-slate-500">{course.code}</p>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label htmlFor="edit-course-name">Name</Label>
            <Input
              id="edit-course-name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-course-code">Code</Label>
            <Input
              id="edit-course-code"
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-course-description">Description</Label>
            <Input
              id="edit-course-description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
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
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </SheetContent>
  );
}
