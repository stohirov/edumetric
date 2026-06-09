"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { settingsApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { useAsync } from "@/lib/use-async";
import { locales, localeLabels } from "@/lib/i18n/types";
import type {
  GradingScale,
  InstitutionSettings,
  UpdateInstitutionSettingsRequest,
} from "@/types/api";

const GRADING_SCALES: { value: GradingScale; label: string }[] = [
  { value: "PERCENT", label: "Percentage (0–100)" },
  { value: "LETTER", label: "Letter (A–F)" },
  { value: "GPA_4", label: "GPA (0.0–4.0)" },
];

function SettingsForm({ initial }: { initial: InstitutionSettings }) {
  const [institutionName, setInstitutionName] = useState(initial.institutionName);
  const [defaultLocale, setDefaultLocale] = useState(initial.defaultLocale);
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor ?? "#6366f1");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [gradingScale, setGradingScale] = useState<GradingScale>(initial.gradingScale);
  const [atRiskThreshold, setAtRiskThreshold] = useState(String(initial.atRiskThreshold));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const threshold = Number(atRiskThreshold);
    if (Number.isNaN(threshold) || threshold < 0 || threshold > 100) {
      setError("At-risk threshold must be between 0 and 100");
      return;
    }
    if (!institutionName.trim()) {
      setError("Institution name is required");
      return;
    }

    const payload: UpdateInstitutionSettingsRequest = {};
    if (institutionName.trim() !== initial.institutionName) {
      payload.institutionName = institutionName.trim();
    }
    if (defaultLocale !== initial.defaultLocale) payload.defaultLocale = defaultLocale;
    if (primaryColor !== (initial.primaryColor ?? "#6366f1")) payload.primaryColor = primaryColor;
    if (logoUrl.trim() !== (initial.logoUrl ?? "")) payload.logoUrl = logoUrl.trim();
    if (gradingScale !== initial.gradingScale) payload.gradingScale = gradingScale;
    if (threshold !== initial.atRiskThreshold) payload.atRiskThreshold = threshold;

    if (Object.keys(payload).length === 0) {
      setSuccess(true);
      return;
    }

    setSubmitting(true);
    try {
      await settingsApi.updateSettings(payload);
      setSuccess(true);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to save settings";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="inst-name">Institution name</Label>
        <Input
          id="inst-name"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inst-locale">Default language</Label>
        <Select value={defaultLocale} onValueChange={setDefaultLocale}>
          <SelectTrigger id="inst-locale" className="max-w-[12rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locales.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {localeLabels[loc]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inst-grading">Grading scale</Label>
        <Select
          value={gradingScale}
          onValueChange={(v) => setGradingScale(v as GradingScale)}
        >
          <SelectTrigger id="inst-grading" className="max-w-[16rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADING_SCALES.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inst-threshold">At-risk threshold (composite score)</Label>
        <Input
          id="inst-threshold"
          type="number"
          min={0}
          max={100}
          step={1}
          className="max-w-[12rem]"
          value={atRiskThreshold}
          onChange={(e) => setAtRiskThreshold(e.target.value)}
        />
        <p className="text-xs text-theme-muted">
          Students scoring below this value are flagged at-risk.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inst-color">Primary brand color</Label>
        <div className="flex items-center gap-3">
          <input
            id="inst-color"
            type="color"
            className="h-10 w-14 cursor-pointer rounded-[10px] border border-theme bg-theme-input"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
          <Input
            aria-label="Primary color hex"
            className="max-w-[10rem]"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inst-logo">Logo URL</Label>
        <Input
          id="inst-logo"
          placeholder="https://…"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </div>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Settings saved.
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

export function InstitutionSettingsCard() {
  const query = useAsync(() => settingsApi.getSettings(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution settings</CardTitle>
        <CardDescription>
          Branding, default language, grading scale, and at-risk policy
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.loading ? (
          <LoadingState />
        ) : query.error ? (
          <ErrorState message={query.error.message} onRetry={query.reload} />
        ) : query.data ? (
          <SettingsForm initial={query.data} />
        ) : null}
      </CardContent>
    </Card>
  );
}
