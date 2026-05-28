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
import { teachersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface FormState {
  email: string;
  password: string;
  fullName: string;
  department: string;
}

const EMPTY: FormState = {
  email: "",
  password: "",
  fullName: "",
  department: "",
};

export function AddTeacherDialog({
  open,
  onOpenChange,
  onCreated,
}: AddTeacherDialogProps) {
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
    if (!form.email || !form.password || !form.fullName) {
      setError("Email, password, and full name are required");
      return;
    }
    setSubmitting(true);
    try {
      await teachersApi.createTeacher({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        department: form.department.trim() || undefined,
      });
      onCreated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to create teacher";
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
            <SheetTitle>Add teacher</SheetTitle>
            <p className="text-sm text-slate-500">
              Create a new teacher account.
            </p>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="space-y-2">
              <Label htmlFor="add-teacher-fullname">Full name</Label>
              <Input
                id="add-teacher-fullname"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                placeholder="Dr. Jane Smith"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-teacher-email">Email</Label>
              <Input
                id="add-teacher-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="jane@school.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-teacher-password">Temporary password</Label>
              <Input
                id="add-teacher-password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-teacher-department">Department</Label>
              <Input
                id="add-teacher-department"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                placeholder="Mathematics (optional)"
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
              {submitting ? "Creating…" : "Create teacher"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
