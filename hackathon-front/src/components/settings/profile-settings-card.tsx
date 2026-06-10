"use client";

import { useEffect, useRef, useState } from "react";
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
import { authApi, profileApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { isLocale, locales, localeLabels } from "@/lib/i18n/types";
import type { UpdateProfileRequest } from "@/types/api";

/** First letters of up to two name parts, e.g. "Ada Lovelace" → "AL". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.details?.join(", ") ?? e.message;
  if (e instanceof Error) return e.message;
  return fallback;
}

export function ProfileSettingsCard() {
  const { user, refresh } = useAuth();
  const { setLocale } = useLocale();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [notifyEmail, setNotifyEmail] = useState(user?.notifyEmail ?? true);
  const [notifyInApp, setNotifyInApp] = useState(user?.notifyInApp ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Avatar state — loaded lazily from the authenticated /profile/avatar endpoint.
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email-verification prompt — shown until the owner confirms their address.
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  const avatarUrl = user?.avatarUrl ?? null;
  useEffect(() => {
    if (!avatarUrl) return;
    let active = true;
    let objectUrl: string | null = null;
    profileApi
      .getAvatar()
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setAvatarSrc(objectUrl);
      })
      .catch(() => {
        /* fall back to initials */
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarUrl, avatarVersion]);

  if (!user) return null;

  const showAvatar = Boolean(avatarUrl) && Boolean(avatarSrc);

  const onAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      await profileApi.uploadAvatar(file);
      await refresh();
      setAvatarVersion((v) => v + 1); // force a re-fetch even if the URL is unchanged
    } catch (e) {
      setAvatarError(errorMessage(e, "Failed to upload avatar"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const onAvatarRemove = async () => {
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      await profileApi.deleteAvatar();
      await refresh();
      setAvatarSrc(null);
    } catch (e) {
      setAvatarError(errorMessage(e, "Failed to remove avatar"));
    } finally {
      setAvatarBusy(false);
    }
  };

  const onResendVerification = async () => {
    setVerifyBusy(true);
    try {
      await authApi.resendVerification({ email: user.email });
    } finally {
      // The endpoint always succeeds; show confirmation regardless.
      setVerifySent(true);
      setVerifyBusy(false);
    }
  };

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
    if (phone.trim() !== (user.phone ?? "")) payload.phone = phone.trim();
    if (address.trim() !== (user.address ?? "")) payload.address = address.trim();
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
      setError(errorMessage(e, "Failed to update profile"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your photo, contact info, password, language, and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4 max-w-lg">
          {!user.emailVerified ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
              {verifySent ? (
                <p>
                  Verification link sent to <span className="font-medium">{user.email}</span>. Check
                  your inbox to confirm your address.
                </p>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Your email address isn&apos;t verified yet.</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={verifyBusy}
                    onClick={onResendVerification}
                  >
                    {verifyBusy ? "Sending…" : "Send verification email"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
              {showAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc as string}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials(user.fullName) || "?"}</span>
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onAvatarSelected}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={avatarBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarBusy ? "Working…" : avatarUrl ? "Change photo" : "Upload photo"}
                </Button>
                {avatarUrl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={avatarBusy}
                    onClick={onAvatarRemove}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-theme-muted">JPEG, PNG, WebP, or GIF · up to 5 MB</p>
            </div>
          </div>
          {avatarError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {avatarError}
            </div>
          ) : null}

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
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-address">Address</Label>
            <Input
              id="profile-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, country"
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
