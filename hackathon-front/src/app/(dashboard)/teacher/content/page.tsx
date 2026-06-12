"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  History,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { contentApi, teachersApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type {
  MaterialDto,
  MaterialType,
  MaterialVersionDto,
  ModuleDto,
} from "@/types/api/content";

const MATERIAL_TYPES: MaterialType[] = ["PAGE", "FILE", "LINK", "VIDEO"];

const NONE_PREREQ = "__none__";

interface CourseOption {
  courseId: number;
  courseName: string;
}

function errMsg(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

export default function TeacherContentPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.teacherContent;

  const groupsQuery = useAsync(() => teachersApi.listMyGroups(), [user?.id]);

  const courses = useMemo<CourseOption[]>(() => {
    const byId = new Map<number, CourseOption>();
    for (const g of groupsQuery.data ?? []) {
      if (!byId.has(g.courseId)) {
        byId.set(g.courseId, { courseId: g.courseId, courseName: g.courseName });
      }
    }
    return [...byId.values()];
  }, [groupsQuery.data]);

  const [courseId, setCourseId] = useState<number | null>(null);
  const activeCourseId = courseId ?? courses[0]?.courseId ?? null;

  const modulesQuery = useAsync(
    () =>
      activeCourseId == null
        ? Promise.resolve<ModuleDto[]>([])
        : contentApi.listModules(activeCourseId),
    [activeCourseId],
  );

  return (
    <RouteGuard allow={["TEACHER", "ADMIN"]}>
      <DashboardShell
        role="teacher"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header title={tt.title} description={tt.desc} />
        <div className="p-8">
          {groupsQuery.loading ? (
            <LoadingState />
          ) : groupsQuery.error ? (
            <ErrorState
              message={groupsQuery.error.message}
              onRetry={groupsQuery.reload}
            />
          ) : courses.length === 0 ? (
            <p className="text-sm text-theme-muted">{tt.noCourses}</p>
          ) : (
            <div className="space-y-6">
              <div className="max-w-xs">
                <Label className="mb-1.5 block">{tt.selectCourse}</Label>
                <Select
                  value={activeCourseId != null ? String(activeCourseId) : ""}
                  onValueChange={(v) => setCourseId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tt.selectCourse} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.courseId} value={String(c.courseId)}>
                        {c.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{tt.modules}</CardTitle>
                  <CardDescription>{tt.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modulesQuery.loading ? (
                    <LoadingState />
                  ) : modulesQuery.error ? (
                    <ErrorState
                      message={modulesQuery.error.message}
                      onRetry={modulesQuery.reload}
                    />
                  ) : (modulesQuery.data ?? []).length === 0 ? (
                    <p className="py-6 text-center text-sm text-theme-muted">
                      {tt.noModules}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(modulesQuery.data ?? []).map((m) => (
                        <ModuleRow
                          key={m.id}
                          module={m}
                          allModules={modulesQuery.data ?? []}
                          onChanged={modulesQuery.reload}
                        />
                      ))}
                    </div>
                  )}

                  {activeCourseId != null && (
                    <NewModuleForm
                      courseId={activeCourseId}
                      existingModules={modulesQuery.data ?? []}
                      onCreated={modulesQuery.reload}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

function ModuleRow({
  module,
  allModules,
  onChanged,
}: {
  module: ModuleDto;
  allModules: ModuleDto[];
  onChanged: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherContent;

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [summary, setSummary] = useState(module.summary ?? "");
  const [prerequisite, setPrerequisite] = useState<string>(
    module.prerequisiteModuleId != null
      ? String(module.prerequisiteModuleId)
      : NONE_PREREQ,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prereqOptions = allModules.filter((m) => m.id !== module.id);

  const togglePublish = async () => {
    setBusy(true);
    setError(null);
    try {
      await contentApi.updateModule(module.id, { published: !module.published });
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await contentApi.updateModule(module.id, {
        title: title.trim(),
        summary: summary.trim() || null,
        prerequisiteModuleId:
          prerequisite === NONE_PREREQ ? 0 : Number(prerequisite),
      });
      setEditing(false);
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(tt.confirmDelete)) return;
    setBusy(true);
    setError(null);
    try {
      await contentApi.deleteModule(module.id);
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[10px] border border-theme">
      <div className="flex items-start justify-between gap-3 p-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          {expanded ? (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium text-theme">
              <span className="truncate">{module.title}</span>
              <Badge variant={module.published ? "secondary" : "outline"}>
                {module.published ? tt.published : tt.draft}
              </Badge>
            </p>
            {module.summary && (
              <p className="mt-0.5 truncate text-xs text-theme-muted">
                {module.summary}
              </p>
            )}
            {module.prerequisiteModuleId != null && (
              <p className="mt-0.5 truncate text-xs text-theme-muted">
                Requires:{" "}
                {allModules.find((m) => m.id === module.prerequisiteModuleId)
                  ?.title ?? `#${module.prerequisiteModuleId}`}
              </p>
            )}
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={togglePublish}
          >
            {module.published ? tt.unpublish : tt.publish}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            {tt.edit}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={remove}
            className="text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {editing && (
        <div className="space-y-3 border-t border-theme bg-slate-50/50 p-4">
          <div className="space-y-1.5">
            <Label>{tt.moduleTitle}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{tt.summary}</Label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          {prereqOptions.length > 0 && (
            <div className="space-y-1.5">
              <Label>Prerequisite module</Label>
              <Select value={prerequisite} onValueChange={setPrerequisite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PREREQ}>None</SelectItem>
                  {prereqOptions.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={saveEdit}
            className="gap-1.5"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? tt.saving : tt.save}
          </Button>
        </div>
      )}

      {error && (
        <p className="px-4 pb-2 text-xs text-rose-600">{error}</p>
      )}

      {expanded && (
        <div className="space-y-3 border-t border-theme p-4">
          {module.materials.length === 0 ? (
            <p className="text-sm text-theme-muted">{tt.noMaterials}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {module.materials.map((mat) => (
                <MaterialRow
                  key={mat.id}
                  material={mat}
                  onChanged={onChanged}
                />
              ))}
            </ul>
          )}
          <NewMaterialForm moduleId={module.id} onCreated={onChanged} />
        </div>
      )}
    </div>
  );
}

function MaterialRow({
  material,
  onChanged,
}: {
  material: MaterialDto;
  onChanged: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherContent;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content ?? "");
  const [url, setUrl] = useState(material.url ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<MaterialVersionDto[] | null>(null);

  const toggleHistory = async () => {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(true);
    setError(null);
    try {
      setVersions(await contentApi.listMaterialVersions(material.id));
    } catch (e) {
      setError(errMsg(e, tt.error));
    }
  };

  const restore = async (versionId: number) => {
    setBusy(true);
    setError(null);
    try {
      await contentApi.restoreMaterialVersion(material.id, versionId);
      setHistoryOpen(false);
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    try {
      const blob = await contentApi.downloadMaterialFile(material.id);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = material.fileName ?? "material";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      setError(errMsg(e, tt.error));
    }
  };

  const togglePublish = async () => {
    setBusy(true);
    setError(null);
    try {
      await contentApi.updateMaterial(material.id, {
        published: !material.published,
      });
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await contentApi.updateMaterial(material.id, {
        title: title.trim(),
        content: material.type === "PAGE" ? content : undefined,
        url:
          material.type === "LINK" || material.type === "VIDEO"
            ? url.trim() || null
            : undefined,
      });
      setEditing(false);
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(tt.confirmDelete)) return;
    setBusy(true);
    setError(null);
    try {
      await contentApi.deleteMaterial(material.id);
      onChanged();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-theme">
            <span className="truncate">{material.title}</span>
            <Badge variant="secondary">{tt.types[material.type]}</Badge>
            <Badge variant={material.published ? "secondary" : "outline"}>
              {material.published ? tt.published : tt.draft}
            </Badge>
          </p>
          {(material.type === "LINK" || material.type === "VIDEO") &&
            material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink className="h-3 w-3" />
                {material.url}
              </a>
            )}
          {material.type === "FILE" && material.hasFile && (
            <button
              type="button"
              onClick={download}
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <Download className="h-3 w-3" />
              {material.fileName ?? tt.download}
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={togglePublish}
          >
            {material.published ? tt.unpublish : tt.publish}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            {tt.edit}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleHistory}
            title="Version history"
          >
            <History className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={remove}
            className="text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 space-y-3 rounded-[10px] border border-theme bg-slate-50/50 p-3">
          <div className="space-y-1.5">
            <Label>{tt.materialTitle}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          {material.type === "PAGE" && (
            <div className="space-y-1.5">
              <Label>{tt.content}</Label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2.5 text-sm shadow-[var(--shadow-xs)] focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20"
              />
            </div>
          )}
          {(material.type === "LINK" || material.type === "VIDEO") && (
            <div className="space-y-1.5">
              <Label>{tt.url}</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          )}
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={saveEdit}
            className="gap-1.5"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? tt.saving : tt.save}
          </Button>
        </div>
      )}

      {historyOpen && (
        <div className="mt-3 space-y-2 rounded-[10px] border border-theme bg-slate-50/50 p-3">
          <p className="text-xs font-medium text-theme-muted">Version history</p>
          {versions === null ? (
            <p className="text-xs text-theme-muted">Loading…</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-theme-muted">
              No previous versions yet — edits create history entries.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="min-w-0 truncate text-theme">
                    v{v.versionNo} · {v.title ?? "—"} ·{" "}
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => restore(v.id)}
                  >
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </li>
  );
}

function NewModuleForm({
  courseId,
  existingModules,
  onCreated,
}: {
  courseId: number;
  existingModules: ModuleDto[];
  onCreated: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherContent;

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [prerequisite, setPrerequisite] = useState<string>(NONE_PREREQ);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError(tt.error);
      return;
    }
    setBusy(true);
    try {
      await contentApi.createModule({
        courseId,
        title: title.trim(),
        summary: summary.trim() || null,
        published,
        prerequisiteModuleId:
          prerequisite === NONE_PREREQ ? undefined : Number(prerequisite),
      });
      setTitle("");
      setSummary("");
      setPrerequisite(NONE_PREREQ);
      setPublished(false);
      onCreated();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-[10px] border border-theme bg-slate-50/50 p-4"
    >
      <p className="text-label">{tt.newModule}</p>
      <div className="space-y-1.5">
        <Label htmlFor="mod-title">{tt.moduleTitle}</Label>
        <Input
          id="mod-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mod-summary">{tt.summary}</Label>
        <Input
          id="mod-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      {existingModules.length > 0 && (
        <div className="space-y-1.5">
          <Label>Prerequisite module</Label>
          <Select value={prerequisite} onValueChange={setPrerequisite}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_PREREQ}>None</SelectItem>
              {existingModules.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-theme">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        {tt.published}
      </label>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {busy ? tt.creating : tt.create}
      </Button>
    </form>
  );
}

function NewMaterialForm({
  moduleId,
  onCreated,
}: {
  moduleId: number;
  onCreated: () => void;
}) {
  const t = useT();
  const tt = t.pages.teacherContent;

  const [title, setTitle] = useState("");
  const [type, setType] = useState<MaterialType>("PAGE");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setContent("");
    setUrl("");
    setFile(null);
    setPublished(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError(tt.error);
      return;
    }
    setBusy(true);
    try {
      const created = await contentApi.createMaterial(moduleId, {
        title: title.trim(),
        type,
        content: type === "PAGE" ? content : null,
        url:
          type === "LINK" || type === "VIDEO" ? url.trim() || null : null,
        published,
      });
      if (type === "FILE" && file) {
        await contentApi.uploadMaterialFile(created.id, file);
      }
      reset();
      onCreated();
    } catch (e) {
      setError(errMsg(e, tt.error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-[10px] border border-theme bg-white p-4"
    >
      <p className="text-label">{tt.newMaterial}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{tt.materialTitle}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{tt.type}</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as MaterialType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_TYPES.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {tt.types[tp]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {type === "PAGE" && (
        <div className="space-y-1.5">
          <Label>{tt.content}</Label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="flex w-full rounded-[10px] border border-theme bg-theme-input px-3.5 py-2.5 text-sm shadow-[var(--shadow-xs)] focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/20"
          />
        </div>
      )}
      {(type === "LINK" || type === "VIDEO") && (
        <div className="space-y-1.5">
          <Label>{tt.url}</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
      )}
      {type === "FILE" && (
        <div className="space-y-1.5">
          <Label>{tt.file}</Label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-theme-muted">
            {file ? file.name : tt.noFileChosen}
          </p>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-theme">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        {tt.published}
      </label>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {busy ? tt.adding : tt.add}
      </Button>
    </form>
  );
}
