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
import { groupsApi, studentsApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { GroupDto } from "@/types/api";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface FormState {
  email: string;
  password: string;
  fullName: string;
  groupId: string;
}

const EMPTY: FormState = {
  email: "",
  password: "",
  fullName: "",
  groupId: "",
};

export function AddStudentDialog({
  open,
  onOpenChange,
  onCreated,
}: AddStudentDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    let cancelled = false;
    groupsApi
      .listGroups({ page: 0, size: 100 })
      .then((res) => {
        if (cancelled) return;
        setGroups(res.items);
        setForm((f) =>
          f.groupId || res.items.length === 0
            ? f
            : { ...f, groupId: String(res.items[0].id) },
        );
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load groups");
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
    if (!form.email || !form.password || !form.fullName || !form.groupId) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      await studentsApi.createStudent({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        groupId: Number(form.groupId),
      });
      onCreated?.();
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to create student";
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
            <SheetTitle>Add student</SheetTitle>
            <p className="text-sm text-slate-500">
              Create a new student account and enroll them in a group.
            </p>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="space-y-2">
              <Label htmlFor="add-student-fullname">Full name</Label>
              <Input
                id="add-student-fullname"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                placeholder="Jane Smith"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-student-email">Email</Label>
              <Input
                id="add-student-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="jane@school.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-student-password">Temporary password</Label>
              <Input
                id="add-student-password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-student-group">Group</Label>
              <Select
                value={form.groupId}
                onValueChange={(v) => setForm((f) => ({ ...f, groupId: v }))}
              >
                <SelectTrigger id="add-student-group">
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
              {groups.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No groups available. Create a group first.
                </p>
              ) : null}
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
              disabled={submitting || groups.length === 0}
            >
              {submitting ? "Creating…" : "Create student"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
