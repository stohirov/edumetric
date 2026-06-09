"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useT } from "@/components/providers/locale-provider";
import { authApi, ApiError } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordCard() {
  const t = useT();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t.passwordReset.errors.missingToken);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.passwordReset.errors.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(t.passwordReset.errors.passwordsMismatch);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(t.passwordReset.errors.invalidToken);
      } else {
        setError(t.passwordReset.errors.generic);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[420px] animate-fade-in">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="card-surface rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-elevated)]">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-theme">
                {t.passwordReset.reset.successTitle}
              </h2>
              <p className="mt-2 text-sm text-theme-muted">
                {t.passwordReset.reset.successMsg}
              </p>
              <Button asChild className="mt-8 h-11 w-full">
                <Link href="/login">
                  {t.passwordReset.reset.goToLogin}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-theme">
                  {t.passwordReset.reset.title}
                </h2>
                <p className="mt-2 text-sm text-theme-muted">
                  {t.passwordReset.reset.subtitle}
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 animate-fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{error}</AlertTitle>
                  {!token && (
                    <AlertDescription>
                      <Link href="/forgot-password" className="underline">
                        {t.passwordReset.forgot.title}
                      </Link>
                    </AlertDescription>
                  )}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t.passwordReset.reset.newPassword}
                  </Label>
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
                      disabled={isLoading}
                      className="h-11 pr-10 transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted transition-colors hover:text-slate-600"
                      tabIndex={-1}
                      aria-label={
                        showPassword
                          ? t.login.hidePassword
                          : t.login.showPassword
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
                  <Label htmlFor="confirm">
                    {t.passwordReset.reset.confirmPassword}
                  </Label>
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
                    disabled={isLoading}
                    className="h-11 transition-shadow"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full text-base shadow-md shadow-indigo-600/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.passwordReset.reset.submitting}
                    </>
                  ) : (
                    <>
                      {t.passwordReset.reset.submit}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <Link
                href="/login"
                className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-theme-muted transition-colors hover:text-theme"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.passwordReset.reset.backToLogin}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
