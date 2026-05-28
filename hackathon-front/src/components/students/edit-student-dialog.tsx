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
import { useT } from "@/components/providers/locale-provider";
import { groupsApi, studentsApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { GroupDto, StudentDto, UpdateStudentRequest } from "@/types/api";

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDto | null;
  onUpdated?: () => void;
}

interface FormState {
  fullName: string;
  groupId: string;
  enrolledAt: string;
}

export function EditStudentDialog(props: EditStudentDialogProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {props.student ? (
        <EditStudentDialogBody key={props.student.id} {...props} student={props.student} />
      ) : null}
    </Sheet>
  );
}

interface EditStudentDialogBodyProps extends Omit<EditStudentDialogProps, "student"> {
  student: StudentDto;
}

function EditStudentDialogBody({
  onOpenChange,
  student,
  onUpdated,
}: EditStudentDialogBodyProps) {
  const t = useT();
  const [form, setForm] = useState<FormState>(() => ({
    fullName: student.fullName,
    groupId: student.groupId != null ? String(student.groupId) : "",
    enrolledAt: student.enrolledAt ?? "",
  }));
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    groupsApi
      .listGroups({ page: 0, size: 100 })
      .then((res) => {
        if (!cancelled) setGroups(res.items);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load groups");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    const payload: UpdateStudentRequest = {};
    if (form.fullName.trim() !== student.fullName) {
      payload.fullName = form.fullName.trim();
    }
    const nextGroupId = form.groupId ? Number(form.groupId) : null;
    if (nextGroupId != null && nextGroupId !== student.groupId) {
      payload.groupId = nextGroupId;
    }
    if (form.enrolledAt && form.enrolledAt !== student.enrolledAt) {
      payload.enrolledAt = form.enrolledAt;
    }
    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }
    setSubmitting(true);
    try {
      await studentsApi.updateStudent(student.id, payload);
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to update student";
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
          <SheetTitle>{t.common.editStudent}</SheetTitle>
          <p className="text-sm text-slate-500">{student.email}</p>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label htmlFor="edit-student-fullname">Full name</Label>
            <Input
              id="edit-student-fullname"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-student-group">Group</Label>
            <Select
              value={form.groupId}
              onValueChange={(v) => setForm((f) => ({ ...f, groupId: v }))}
            >
              <SelectTrigger id="edit-student-group">
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
            <Label htmlFor="edit-student-enrolled">Enrolled at</Label>
            <Input
              id="edit-student-enrolled"
              type="date"
              value={form.enrolledAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, enrolledAt: e.target.value }))
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
              {t.common.cancel}
            </Button>
          </SheetClose>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? `${t.common.save}…` : t.common.save}
          </Button>
        </div>
      </form>
    </SheetContent>
  );
}
