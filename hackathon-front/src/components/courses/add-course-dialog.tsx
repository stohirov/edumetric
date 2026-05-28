"use client";

import { useEffect, useState } from "react";
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

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface FormState {
  name: string;
  code: string;
  description: string;
}

const EMPTY: FormState = { name: "", code: "", description: "" };

export function AddCourseDialog({
  open,
  onOpenChange,
  onCreated,
}: AddCourseDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY);
      setError(null);
    }
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.code.trim()) {
      setError("Name and code are required");
      return;
    }
    setSubmitting(true);
    try {
      await coursesApi.createCourse({
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
      });
      onCreated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to create course";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(100vw,28rem)] p-0"
        aria-describedby={undefined}
      >
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle>Add course</SheetTitle>
            <p className="text-sm text-slate-500">
              Create a new course offered by your institution.
            </p>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="space-y-2">
              <Label htmlFor="add-course-name">Course name</Label>
              <Input
                id="add-course-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Introduction to Algorithms"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-course-code">Code</Label>
              <Input
                id="add-course-code"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="CS101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-course-description">Description</Label>
              <Input
                id="add-course-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional description"
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
              {submitting ? "Creating…" : "Create course"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
