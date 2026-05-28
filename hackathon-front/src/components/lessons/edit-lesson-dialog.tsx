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
import type {
  CourseDto,
  GroupDto,
  LessonDto,
  TeacherDto,
  UpdateLessonRequest,
} from "@/types/api";

interface EditLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonDto | null;
  onUpdated?: () => void;
}

interface FormState {
  groupId: string;
  courseId: string;
  teacherId: string;
  topic: string;
  scheduledAt: string;
}

// Convert backend ISO string (with offset) to value usable by datetime-local input.
function toLocalInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditLessonDialog(props: EditLessonDialogProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {props.lesson ? (
        <EditLessonDialogBody
          key={props.lesson.id}
          onOpenChange={props.onOpenChange}
          lesson={props.lesson}
          onUpdated={props.onUpdated}
        />
      ) : null}
    </Sheet>
  );
}

interface EditLessonDialogBodyProps {
  onOpenChange: (open: boolean) => void;
  lesson: LessonDto;
  onUpdated?: () => void;
}

function EditLessonDialogBody({
  onOpenChange,
  lesson,
  onUpdated,
}: EditLessonDialogBodyProps) {
  const [form, setForm] = useState<FormState>(() => ({
    groupId: String(lesson.groupId),
    courseId: String(lesson.courseId),
    teacherId: String(lesson.teacherId),
    topic: lesson.topic,
    scheduledAt: toLocalInputValue(lesson.scheduledAt),
  }));
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load form data");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.topic.trim() || !form.scheduledAt) {
      setError("Topic and scheduled time are required");
      return;
    }
    const payload: UpdateLessonRequest = {};
    const nextGroupId = Number(form.groupId);
    if (nextGroupId && nextGroupId !== lesson.groupId) {
      payload.groupId = nextGroupId;
    }
    const nextCourseId = Number(form.courseId);
    if (nextCourseId && nextCourseId !== lesson.courseId) {
      payload.courseId = nextCourseId;
    }
    const nextTeacherId = Number(form.teacherId);
    if (nextTeacherId && nextTeacherId !== lesson.teacherId) {
      payload.teacherId = nextTeacherId;
    }
    if (form.topic.trim() !== lesson.topic) {
      payload.topic = form.topic.trim();
    }
    const nextScheduledIso = new Date(form.scheduledAt).toISOString();
    if (nextScheduledIso !== new Date(lesson.scheduledAt).toISOString()) {
      payload.scheduledAt = nextScheduledIso;
    }
    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }
    setSubmitting(true);
    try {
      await lessonsApi.updateLesson(lesson.id, payload);
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to update lesson";
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
          <SheetTitle>Edit lesson</SheetTitle>
          <p className="text-sm text-slate-500">{lesson.topic}</p>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label htmlFor="edit-lesson-topic">Topic</Label>
            <Input
              id="edit-lesson-topic"
              value={form.topic}
              onChange={(e) =>
                setForm((f) => ({ ...f, topic: e.target.value }))
              }
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-lesson-when">Scheduled at</Label>
            <Input
              id="edit-lesson-when"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, scheduledAt: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-lesson-group">Group</Label>
            <Select
              value={form.groupId}
              onValueChange={(v) => setForm((f) => ({ ...f, groupId: v }))}
            >
              <SelectTrigger id="edit-lesson-group">
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
            <Label htmlFor="edit-lesson-course">Course</Label>
            <Select
              value={form.courseId}
              onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
            >
              <SelectTrigger id="edit-lesson-course">
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
            <Label htmlFor="edit-lesson-teacher">Teacher</Label>
            <Select
              value={form.teacherId}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, teacherId: v }))
              }
            >
              <SelectTrigger id="edit-lesson-teacher">
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
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </SheetContent>
  );
}
