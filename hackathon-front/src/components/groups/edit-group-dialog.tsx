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
import type { CourseDto, GroupDto, UpdateGroupRequest } from "@/types/api";

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupDto | null;
  onUpdated?: () => void;
}

interface FormState {
  name: string;
  courseId: string;
  startDate: string;
  endDate: string;
}

export function EditGroupDialog(props: EditGroupDialogProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {props.group ? (
        <EditGroupDialogBody
          key={props.group.id}
          onOpenChange={props.onOpenChange}
          group={props.group}
          onUpdated={props.onUpdated}
        />
      ) : null}
    </Sheet>
  );
}

interface EditGroupDialogBodyProps {
  onOpenChange: (open: boolean) => void;
  group: GroupDto;
  onUpdated?: () => void;
}

function EditGroupDialogBody({
  onOpenChange,
  group,
  onUpdated,
}: EditGroupDialogBodyProps) {
  const [form, setForm] = useState<FormState>(() => ({
    name: group.name,
    courseId: String(group.courseId),
    startDate: group.startDate ?? "",
    endDate: group.endDate ?? "",
  }));
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    coursesApi
      .listCourses({ page: 0, size: 100 })
      .then((res) => {
        if (!cancelled) setCourses(res.items);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load courses");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    const payload: UpdateGroupRequest = {};
    if (form.name.trim() !== group.name) {
      payload.name = form.name.trim();
    }
    const nextCourseId = Number(form.courseId);
    if (nextCourseId && nextCourseId !== group.courseId) {
      payload.courseId = nextCourseId;
    }
    if (form.startDate && form.startDate !== group.startDate) {
      payload.startDate = form.startDate;
    }
    if (form.endDate && form.endDate !== group.endDate) {
      payload.endDate = form.endDate;
    }
    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }
    setSubmitting(true);
    try {
      await groupsApi.updateGroup(group.id, payload);
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to update group";
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
          <SheetTitle>Edit group</SheetTitle>
          <p className="text-sm text-slate-500">{group.courseName}</p>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label htmlFor="edit-group-name">Group name</Label>
            <Input
              id="edit-group-name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-group-course">Course</Label>
            <Select
              value={form.courseId}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, courseId: v }))
              }
            >
              <SelectTrigger id="edit-group-course">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-start">Start date</Label>
              <Input
                id="edit-group-start"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-end">End date</Label>
              <Input
                id="edit-group-end"
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
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </SheetContent>
  );
}
