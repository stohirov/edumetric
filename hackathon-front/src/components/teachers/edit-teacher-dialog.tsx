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
import { teachersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { TeacherDto, UpdateTeacherRequest } from "@/types/api";

interface EditTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherDto | null;
  onUpdated?: () => void;
}

interface FormState {
  fullName: string;
  department: string;
}

export function EditTeacherDialog(props: EditTeacherDialogProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {props.teacher ? (
        <EditTeacherDialogBody
          key={props.teacher.id}
          onOpenChange={props.onOpenChange}
          teacher={props.teacher}
          onUpdated={props.onUpdated}
        />
      ) : null}
    </Sheet>
  );
}

interface EditTeacherDialogBodyProps {
  onOpenChange: (open: boolean) => void;
  teacher: TeacherDto;
  onUpdated?: () => void;
}

function EditTeacherDialogBody({
  onOpenChange,
  teacher,
  onUpdated,
}: EditTeacherDialogBodyProps) {
  const [form, setForm] = useState<FormState>(() => ({
    fullName: teacher.fullName,
    department: teacher.department ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    const payload: UpdateTeacherRequest = {};
    if (form.fullName.trim() !== teacher.fullName) {
      payload.fullName = form.fullName.trim();
    }
    const nextDepartment = form.department.trim();
    if (nextDepartment !== (teacher.department ?? "")) {
      payload.department = nextDepartment;
    }
    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }
    setSubmitting(true);
    try {
      await teachersApi.updateTeacher(teacher.id, payload);
      onUpdated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to update teacher";
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
          <SheetTitle>Edit teacher</SheetTitle>
          <p className="text-sm text-slate-500">{teacher.email}</p>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label htmlFor="edit-teacher-fullname">Full name</Label>
            <Input
              id="edit-teacher-fullname"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-teacher-department">Department</Label>
            <Input
              id="edit-teacher-department"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              placeholder="Mathematics"
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
