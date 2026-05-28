"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Keyboard,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toast, type ToastMessage } from "@/components/ui/toast";
import { AttendanceStatusToggle } from "./attendance-status-toggle";
import { AttendanceSaveBar } from "./attendance-save-bar";
import { cn } from "@/lib/utils";
import { aosAttributes } from "@/lib/aos";
import type {
  AttendanceSession,
  AttendanceStatus,
  RosterStudent,
  StudentAttendanceEntry,
} from "@/types/attendance";

function createDefaultEntries(
  students: RosterStudent[]
): Record<string, StudentAttendanceEntry> {
  return Object.fromEntries(
    students.map((s) => [
      s.id,
      { studentId: s.id, status: "present" as AttendanceStatus, note: "" },
    ])
  );
}

const KEY_MAP: Record<string, AttendanceStatus> = {
  p: "present",
  "1": "present",
  l: "late",
  "2": "late",
  a: "absent",
  "3": "absent",
  e: "excused",
  "4": "excused",
};

interface BulkAttendancePageProps {
  session: AttendanceSession;
  students: RosterStudent[];
  initialEntries?: Record<string, StudentAttendanceEntry>;
  onPersist?: (
    entries: Record<string, StudentAttendanceEntry>,
  ) => Promise<void>;
}

export function BulkAttendancePage({
  session,
  students,
  initialEntries: initialEntriesProp,
  onPersist,
}: BulkAttendancePageProps) {
  const initialEntries = useMemo(
    () => initialEntriesProp ?? createDefaultEntries(students),
    [initialEntriesProp, students],
  );
  const [entries, setEntries] =
    useState<Record<string, StudentAttendanceEntry>>(initialEntries);
  const [savedSnapshot, setSavedSnapshot] = useState(initialEntries);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(initialEntries);
    setSavedSnapshot(initialEntries);
  }, [initialEntries]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const hasChanges = useMemo(
    () => JSON.stringify(entries) !== JSON.stringify(savedSnapshot),
    [entries, savedSnapshot]
  );

  const counts = useMemo(() => {
    const c: Record<AttendanceStatus, number> = {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
    };
    Object.values(entries).forEach((e) => {
      c[e.status]++;
    });
    return c;
  }, [entries]);

  const setStatus = useCallback((studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setSaveSuccess(false);
  }, []);

  const setNote = useCallback((studentId: string, note: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }));
    setSaveSuccess(false);
  }, []);

  const markAllPresent = useCallback(() => {
    setEntries(createDefaultEntries(students));
    setSaveSuccess(false);
  }, [students]);

  const handleReset = useCallback(() => {
    setEntries(savedSnapshot);
    setSaveSuccess(false);
  }, [savedSnapshot]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      if (onPersist) {
        await onPersist(entries);
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setSavedSnapshot(entries);
      setSaveSuccess(true);
      setToast({
        id: Date.now().toString(),
        title: "Attendance saved",
        description: `${students.length} records updated for ${session.courseName}`,
        variant: "success",
      });
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setToast({
        id: Date.now().toString(),
        title: "Failed to save",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [entries, students.length, session.courseName, onPersist]);

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!isSaving) handleSave();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        markAllPresent();
        return;
      }

      if (isInput && !["ArrowDown", "ArrowUp", "Escape"].includes(e.key)) return;

      const student = students[focusedIndex];
      if (!student) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, students.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        return;
      }

      if (!isInput) {
        const status = KEY_MAP[e.key.toLowerCase()];
        if (status) {
          e.preventDefault();
          setStatus(student.id, status);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedIndex, students, setStatus, handleSave, isSaving, markAllPresent]);

  useEffect(() => {
    rowRefs.current[focusedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [focusedIndex]);

  return (
    <>
      <div className="mx-auto max-w-[1600px] space-y-4 pb-28 px-4 sm:px-6 lg:px-8 lg:pb-24">
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          {...aosAttributes({ animation: "fade-down", duration: 600 })}
        >
          <div>
            <p className="text-sm font-medium text-indigo-600">Bulk attendance</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {session.courseName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{session.groupName}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {session.date} · {session.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {session.room}
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Users className="h-3.5 w-3.5" />
                {students.length} students
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={markAllPresent}>
              Mark all present
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts((s) => !s)}
              className="gap-1.5"
            >
              <Keyboard className="h-4 w-4" />
              Shortcuts
              {showShortcuts ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {showShortcuts && (
          <Card className="animate-fade-in border-indigo-100 bg-indigo-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Keyboard shortcuts
            </p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["P / 1", "Mark focused → Present"],
                ["L / 2", "Mark focused → Late"],
                ["A / 3", "Mark focused → Absent"],
                ["E / 4", "Mark focused → Excused"],
                ["↑ ↓", "Navigate rows"],
                ["⌘S", "Save attendance"],
                ["⌘⇧P", "Mark all present"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs font-medium text-slate-700">
                    {key}
                  </kbd>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card
          className="overflow-hidden border-slate-200/80 shadow-[var(--shadow-card)]"
          {...aosAttributes({ animation: "fade-up", delay: 100, duration: 700 })}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="w-10 px-4 py-3 text-left font-medium text-slate-500">#</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="w-12 px-2 py-3 text-center font-medium text-slate-500">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const entry = entries[student.id];
                  const isFocused = focusedIndex === index;
                  const hasNote = !!entry?.note?.trim();
                  const noteOpen = expandedNotes.has(student.id);
                  const initials = student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2);

                  return (
                    <Fragment key={student.id}>
                      <tr
                        ref={(el) => {
                          rowRefs.current[index] = el;
                        }}
                        onClick={() => setFocusedIndex(index)}
                        className={cn(
                          "border-b border-slate-50 transition-colors duration-150 cursor-pointer",
                          isFocused && "bg-indigo-50/60 ring-1 ring-inset ring-indigo-200",
                          !isFocused && "hover:bg-slate-50/80"
                        )}
                      >
                        <td className="px-4 py-3 tabular-nums text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{student.name}</p>
                              <p className="text-xs text-slate-400">{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <AttendanceStatusToggle
                            value={entry.status}
                            onChange={(status) => setStatus(student.id, status)}
                            compact
                          />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNote(student.id);
                            }}
                            className={cn(
                              "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                              hasNote || noteOpen
                                ? "bg-indigo-100 text-indigo-600"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            )}
                            aria-label="Toggle note"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {noteOpen && (
                        <tr key={`${student.id}-note`} className="bg-slate-50/50">
                          <td colSpan={4} className="px-4 pb-3 pt-0">
                            <Input
                              placeholder="Add a note (optional)…"
                              value={entry.note}
                              onChange={(e) => setNote(student.id, e.target.value)}
                              className="h-9 bg-white text-sm"
                              autoFocus
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AttendanceSaveBar
        counts={counts}
        total={students.length}
        hasChanges={hasChanges}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onSave={handleSave}
        onReset={handleReset}
        onMarkAllPresent={markAllPresent}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
