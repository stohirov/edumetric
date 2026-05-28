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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesApi, groupsApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { CourseDto } from "@/types/api";

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface FormState {
  name: string;
  courseId: string;
  startDate: string;
  endDate: string;
}

const EMPTY: FormState = {
  name: "",
  courseId: "",
  startDate: "",
  endDate: "",
};

export function AddGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: AddGroupDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    let cancelled = false;
    coursesApi
      .listCourses({ page: 0, size: 100 })
      .then((res) => {
        if (cancelled) return;
        setCourses(res.items);
        setForm((f) =>
          f.courseId || res.items.length === 0
            ? f
            : { ...f, courseId: String(res.items[0].id) },
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load courses");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY);
      setError(null);
    }
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.courseId) {
      setError("Name and course are required");
      return;
    }
    setSubmitting(true);
    try {
      await groupsApi.createGroup({
        name: form.name.trim(),
        courseId: Number(form.courseId),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      onCreated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to create group";
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
            <SheetTitle>Add group</SheetTitle>
            <p className="text-sm text-slate-500">
              Create a new cohort and attach it to a course.
            </p>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="space-y-2">
              <Label htmlFor="add-group-name">Group name</Label>
              <Input
                id="add-group-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Spring 2026 — Cohort A"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-group-course">Course</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, courseId: v }))
                }
              >
                <SelectTrigger id="add-group-course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No courses available. Create a course first.
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-group-start">Start date</Label>
                <Input
                  id="add-group-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-group-end">End date</Label>
                <Input
                  id="add-group-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                />
              </div>
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
            <Button
              type="submit"
              size="sm"
              disabled={submitting || courses.length === 0}
            >
              {submitting ? "Creating…" : "Create group"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
