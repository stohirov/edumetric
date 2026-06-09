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
import { profileApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { isLocale, locales, localeLabels } from "@/lib/i18n/types";
import type { UpdateProfileRequest } from "@/types/api";

export function ProfileSettingsCard() {
  const { user, refresh } = useAuth();
  const { setLocale } = useLocale();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [notifyEmail, setNotifyEmail] = useState(user?.notifyEmail ?? true);
  const [notifyInApp, setNotifyInApp] = useState(user?.notifyInApp ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const payload: UpdateProfileRequest = {};
    if (fullName.trim() !== user.fullName) payload.fullName = fullName.trim();
    if (email.trim() !== user.email) payload.email = email.trim();
    if (password) payload.password = password;
    if (language !== user.language) payload.language = language;
    if (notifyEmail !== user.notifyEmail) payload.notifyEmail = notifyEmail;
    if (notifyInApp !== user.notifyInApp) payload.notifyInApp = notifyInApp;

    if (Object.keys(payload).length === 0) {
      setSuccess(true);
      return;
    }

    setSubmitting(true);
    try {
      await profileApi.updateProfile(payload);
      await refresh();
      // Keep the UI locale in sync with the saved preference.
      if (payload.language && isLocale(payload.language)) {
        setLocale(payload.language);
      }
      setPassword("");
      setSuccess(true);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? (e.details?.join(", ") ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to update profile";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your account name, email, password, language, and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="profile-fullname">Full name</Label>
            <Input
              id="profile-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-password">New password</Label>
            <Input
              id="profile-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="profile-language" className="max-w-[12rem]">
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
            <span className="text-sm font-medium text-theme">Notifications</span>
            <label className="flex items-center gap-2 text-sm text-theme">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-theme accent-indigo-600"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              Email notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-theme">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-theme accent-indigo-600"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
              />
              In-app notifications
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-theme-muted">Role</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {user.role}
            </span>
          </div>

          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Profile saved.
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
