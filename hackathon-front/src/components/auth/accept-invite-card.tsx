"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { invitationsApi, ApiError } from "@/lib/api";
import type { InvitationPreviewDto } from "@/types/api";

const MIN_PASSWORD_LENGTH = 8;

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

export function AcceptInviteCard() {
  const token = useSearchParams().get("token") ?? "";

  const [preview, setPreview] = useState<InvitationPreviewDto | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setPreviewError("This invitation link is missing a token.");
      setPreviewLoading(false);
      return;
    }
    setPreviewLoading(true);
    invitationsApi
      .previewInvitation(token)
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        if (data.fullName) setFullName(data.fullName);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPreviewError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }

    setSubmitting(true);
    try {
      await invitationsApi.acceptInvitation({
        token,
        password,
        fullName: fullName.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[420px] animate-fade-in">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="card-surface rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-elevated)]">
          {previewLoading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-theme-muted">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <p className="text-sm">Loading invitation…</p>
            </div>
          ) : previewError ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-theme">
                Invitation unavailable
              </h2>
              <p className="mt-2 text-sm text-theme-muted">{previewError}</p>
              <Button asChild variant="outline" className="mt-8 h-11 w-full">
                <Link href="/login">Go to login</Link>
              </Button>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-theme">
                You’re all set
              </h2>
              <p className="mt-2 text-sm text-theme-muted">
                Your account has been created. You can now sign in.
              </p>
              <Button asChild className="mt-8 h-11 w-full">
                <Link href="/login">
                  Go to login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-theme">
                  Accept your invitation
                </h2>
                <p className="mt-2 text-sm text-theme-muted">
                  You’ve been invited to join as{" "}
                  <span className="font-medium text-theme">
                    {preview
                      ? preview.role.charAt(0) +
                        preview.role.slice(1).toLowerCase()
                      : ""}
                  </span>
                  {preview?.email ? (
                    <>
                      {" "}
                      with <span className="font-medium text-theme">
                        {preview.email}
                      </span>
                      .
                    </>
                  ) : (
                    "."
                  )}{" "}
                  Set a password to finish.
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 animate-fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name (optional)</Label>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={submitting}
                    className="h-11 transition-shadow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={submitting}
                      className="h-11 pr-10 transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted transition-colors hover:text-slate-600"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={submitting}
                    className="h-11 transition-shadow"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full text-base shadow-md shadow-indigo-600/20"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
