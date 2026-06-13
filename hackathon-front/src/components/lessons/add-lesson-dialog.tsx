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
import { coursesApi, groupsApi, lessonsApi, teachersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { useT } from "@/components/providers/locale-provider";
import type { CourseDto, GroupDto, TeacherDto } from "@/types/api";

interface AddLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface FormState {
  groupId: string;
  courseId: string;
  teacherId: string;
  topic: string;
  scheduledAt: string;
}

const EMPTY: FormState = {
  groupId: "",
  courseId: "",
  teacherId: "",
  topic: "",
  scheduledAt: "",
};

export function AddLessonDialog({
  open,
  onOpenChange,
  onCreated,
}: AddLessonDialogProps) {
  const tt = useT().pages.lessonDialog;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    let cancelled = false;
    Promise.all([
      groupsApi.listGroups({ page: 0, size: 100 }),
      coursesApi.listCourses({ page: 0, size: 100 }),
      teachersApi.listTeachers({ page: 0, size: 100 }),
    ])
      .then(([gRes, cRes, tRes]) => {
        if (cancelled) return;
        setGroups(gRes.items);
        setCourses(cRes.items);
        setTeachers(tRes.items);
        setForm((f) => ({
          ...f,
          groupId: f.groupId || (gRes.items[0] ? String(gRes.items[0].id) : ""),
          courseId: f.courseId || (cRes.items[0] ? String(cRes.items[0].id) : ""),
          teacherId: f.teacherId || (tRes.items[0] ? String(tRes.items[0].id) : ""),
        }));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : tt.loadError);
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
    if (
      !form.groupId ||
      !form.courseId ||
      !form.teacherId ||
      !form.topic.trim() ||
      !form.scheduledAt
    ) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      await lessonsApi.createLesson({
        groupId: Number(form.groupId),
        courseId: Number(form.courseId),
        teacherId: Number(form.teacherId),
        topic: form.topic.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      onCreated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to create lesson";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const disabled =
    submitting ||
    groups.length === 0 ||
    courses.length === 0 ||
    teachers.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(100vw,28rem)] p-0"
        aria-describedby={undefined}
      >
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle>Add lesson</SheetTitle>
            <p className="text-sm text-slate-500">
              Schedule a lesson for a group, course, and teacher.
            </p>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="space-y-2">
              <Label htmlFor="add-lesson-topic">Topic</Label>
              <Input
                id="add-lesson-topic"
                value={form.topic}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topic: e.target.value }))
                }
                placeholder="Lecture title"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-lesson-when">Scheduled at</Label>
              <Input
                id="add-lesson-when"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-lesson-group">Group</Label>
              <Select
                value={form.groupId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, groupId: v }))
                }
              >
                <SelectTrigger id="add-lesson-group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-lesson-course">Course</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, courseId: v }))
                }
              >
                <SelectTrigger id="add-lesson-course">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-lesson-teacher">Teacher</Label>
              <Select
                value={form.teacherId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, teacherId: v }))
                }
              >
                <SelectTrigger id="add-lesson-teacher">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((tch) => (
                    <SelectItem key={tch.id} value={String(tch.id)}>
                      {tch.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="submit" size="sm" disabled={disabled}>
              {submitting ? "Creating…" : "Create lesson"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
