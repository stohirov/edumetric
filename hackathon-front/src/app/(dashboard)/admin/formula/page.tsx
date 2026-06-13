"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { ErrorState, LoadingState } from "@/components/dashboard/data-states";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { useAsync } from "@/lib/use-async";
import { metricsApi, ApiError } from "@/lib/api";
import type { FormulaPreviewDto, UpdateFormulaRequest } from "@/types/api";

function toMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : fallback;
}

function fmtNum(value: number): string {
  return value.toFixed(1);
}

function fmtMaybe(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

function signed(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

const WEIGHT_FIELDS = [
  { key: "weightGrades" },
  { key: "weightAttendance" },
  { key: "weightPractical" },
  { key: "weightBehavior" },
  { key: "weightActivity" },
  { key: "weightGrowth" },
  { key: "weightConsistency" },
] as const;

type WeightKey = (typeof WEIGHT_FIELDS)[number]["key"];

export default function AdminFormulaPage() {
  const { user } = useAuth();
  const t = useT();
  const tt = t.pages.adminFormula;
  const fallbackError = t.pages.studentContent.error;

  const formulaQuery = useAsync(() => metricsApi.getFormula(), [user?.id]);

  const [version, setVersion] = useState("");
  const [weights, setWeights] = useState<Record<WeightKey, string>>({
    weightGrades: "",
    weightAttendance: "",
    weightPractical: "",
    weightBehavior: "",
    weightActivity: "",
    weightGrowth: "",
    weightConsistency: "",
  });

  const [preview, setPreview] = useState<FormulaPreviewDto | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Render-time sync of the form to the loaded config (runs once when data arrives).
  const [synced, setSynced] = useState(false);
  if (formulaQuery.data && !synced) {
    setSynced(true);
    const d = formulaQuery.data;
    setVersion(d.version);
    setWeights({
      weightGrades: String(d.weightGrades),
      weightAttendance: String(d.weightAttendance),
      weightPractical: String(d.weightPractical),
      weightBehavior: String(d.weightBehavior),
      weightActivity: String(d.weightActivity),
      weightGrowth: String(d.weightGrowth),
      weightConsistency: String(d.weightConsistency),
    });
  }

  const sum = WEIGHT_FIELDS.reduce(
    (acc, f) => acc + (Number(weights[f.key]) || 0),
    0,
  );
  const sumValid = Math.abs(sum - 1.0) <= 0.001;
  const canSubmit = sumValid && version.trim().length > 0;

  function buildPayload(): UpdateFormulaRequest {
    return {
      version: version.trim(),
      weightGrades: Number(weights.weightGrades),
      weightAttendance: Number(weights.weightAttendance),
      weightPractical: Number(weights.weightPractical),
      weightBehavior: Number(weights.weightBehavior),
      weightActivity: Number(weights.weightActivity),
      weightGrowth: Number(weights.weightGrowth),
      weightConsistency: Number(weights.weightConsistency),
    };
  }

  async function handlePreview() {
    setError(null);
    setSuccess(false);
    setPreviewing(true);
    try {
      const result = await metricsApi.previewFormula(buildPayload());
      setPreview(result);
    } catch (err) {
      setError(toMessage(err, fallbackError));
    } finally {
      setPreviewing(false);
    }
  }

  async function handleActivate() {
    setError(null);
    setSuccess(false);
    setActivating(true);
    try {
      await metricsApi.updateFormula(buildPayload());
      setSuccess(true);
      setPreview(null);
      formulaQuery.reload();
    } catch (err) {
      setError(toMessage(err, fallbackError));
    } finally {
      setActivating(false);
    }
  }

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={tt.title}
          description={tt.desc}
        />
        <div className="space-y-6 p-8">
          {formulaQuery.loading ? (
            <LoadingState />
          ) : formulaQuery.error ? (
            <ErrorState
              message={formulaQuery.error.message}
              onRetry={formulaQuery.reload}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{tt.weights}</CardTitle>
                  <CardDescription>
                    {tt.weightsDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">{tt.version}</Label>
                      <Input
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder={tt.versionPlaceholder}
                      />
                    </div>

                    {WEIGHT_FIELDS.map((f) => (
                      <div className="space-y-2" key={f.key}>
                        <Label htmlFor={f.key}>{tt.fields[f.key]}</Label>
                        <Input
                          id={f.key}
                          type="number"
                          min={0}
                          max={1}
                          step={0.01}
                          value={weights[f.key]}
                          onChange={(e) =>
                            setWeights((prev) => ({
                              ...prev,
                              [f.key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}

                    <p
                      className={
                        sumValid
                          ? "text-sm text-emerald-600"
                          : "text-sm text-red-500"
                      }
                    >
                      {tt.total}: {sum.toFixed(3)}
                      {!sumValid && tt.sumMustEqual}
                    </p>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && (
                      <p className="flex items-center gap-1.5 text-sm text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {tt.activated}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreview}
                        disabled={!canSubmit || previewing || activating}
                      >
                        {previewing ? tt.previewing : tt.previewImpact}
                      </Button>
                      <Button
                        onClick={handleActivate}
                        disabled={!canSubmit || activating || previewing}
                      >
                        {activating ? tt.activating : tt.activate}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tt.previewResult}</CardTitle>
                  <CardDescription>
                    {tt.previewResultDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!preview ? (
                    <p className="text-sm text-theme-muted">
                      {tt.runPreview}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-theme-muted">
                            {tt.comparableStudents}
                          </dt>
                          <dd className="font-medium text-theme">
                            {preview.comparableStudents}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-theme-muted">{tt.affected}</dt>
                          <dd className="font-medium text-theme">
                            {preview.affected}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-theme-muted">{tt.increased}</dt>
                          <dd className="font-medium text-emerald-600">
                            {preview.increased}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-theme-muted">{tt.decreased}</dt>
                          <dd className="font-medium text-red-500">
                            {preview.decreased}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-theme-muted">{tt.averageDelta}</dt>
                          <dd className="font-medium text-theme">
                            {signed(preview.averageDelta)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-theme-muted">
                            {tt.currentProjected}
                          </dt>
                          <dd className="font-medium text-theme">
                            {fmtMaybe(preview.currentAverage)} →{" "}
                            {fmtMaybe(preview.projectedAverage)}
                          </dd>
                        </div>
                      </dl>

                      <div>
                        <h3 className="mb-2 text-sm font-medium text-theme">
                          {tt.topMovers}
                        </h3>
                        {preview.topMovers.length === 0 ? (
                          <p className="text-sm text-theme-muted">
                            {tt.noMovers}
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-theme text-left text-xs font-medium text-theme-muted">
                                  <th className="px-3 py-2">{tt.student}</th>
                                  <th className="px-3 py-2">{tt.current}</th>
                                  <th className="px-3 py-2">{tt.projected}</th>
                                  <th className="px-3 py-2">{tt.delta}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {preview.topMovers.map((m) => (
                                  <tr
                                    key={m.studentId}
                                    className="border-b border-theme/60 last:border-0"
                                  >
                                    <td className="px-3 py-3 font-medium text-theme">
                                      {m.studentName}
                                    </td>
                                    <td className="px-3 py-3 text-theme-muted">
                                      {fmtNum(m.currentScore)}
                                    </td>
                                    <td className="px-3 py-3 text-theme-muted">
                                      {fmtNum(m.projectedScore)}
                                    </td>
                                    <td
                                      className={
                                        m.delta >= 0
                                          ? "px-3 py-3 font-medium text-emerald-600"
                                          : "px-3 py-3 font-medium text-red-500"
                                      }
                                    >
                                      {signed(m.delta)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
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
