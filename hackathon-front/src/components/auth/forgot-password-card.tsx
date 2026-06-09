"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import { authApi } from "@/lib/api";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ForgotPasswordCard() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t.passwordReset.errors.emailRequired);
      return;
    }
    if (!validateEmail(email.trim())) {
      setError(t.passwordReset.errors.invalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch {
      // Never reveal account existence — treat any error as success-shaped.
      setSubmitted(true);
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
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-theme">
                {t.passwordReset.forgot.successTitle}
              </h2>
              <p className="mt-2 text-sm text-theme-muted">
                {t.passwordReset.forgot.successMsg}
              </p>
              <Button asChild variant="outline" className="mt-8 h-11 w-full">
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4" />
                  {t.passwordReset.forgot.backToLogin}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-theme">
                  {t.passwordReset.forgot.title}
                </h2>
                <p className="mt-2 text-sm text-theme-muted">
                  {t.passwordReset.forgot.subtitle}
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
                  <Label htmlFor="email">
                    {t.passwordReset.forgot.emailLabel}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={isLoading}
                    className={cn(
                      "h-11 transition-shadow",
                      error && "border-red-300 focus-visible:ring-red-400",
                    )}
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
                      {t.passwordReset.forgot.submitting}
                    </>
                  ) : (
                    <>
                      {t.passwordReset.forgot.submit}
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
                {t.passwordReset.forgot.backToLogin}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
