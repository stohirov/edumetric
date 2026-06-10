"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MailCheck,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authApi } from "@/lib/api";

type Status = "verifying" | "success" | "error" | "no-token";

export function VerifyEmailCard() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "verifying" : "no-token");

  // Resend form state (shown when there's no token or the token was rejected).
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    authApi
      .verifyEmail({ token })
      .then(() => {
        if (active) setStatus("success");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResending(true);
    try {
      // The endpoint always succeeds and never reveals account state, so we show the
      // same confirmation regardless — only a transport error would surface differently.
      await authApi.resendVerification({ email: email.trim() });
    } finally {
      setResent(true);
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[420px] animate-fade-in">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="card-surface rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-elevated)]">
          {status === "verifying" && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/40">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-theme">
                Verifying your email…
              </h2>
              <p className="mt-2 text-sm text-theme-muted">
                Hang tight while we confirm your address.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-theme">
                Email verified
              </h2>
              <p className="mt-2 text-sm text-theme-muted">
                Thanks for confirming your address. You&apos;re all set.
              </p>
              <Button asChild className="mt-8 h-11 w-full">
                <Link href="/login">
                  Continue to sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {(status === "error" || status === "no-token") && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/40">
                  <MailCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-theme">
                  Verify your email
                </h2>
                <p className="mt-2 text-sm text-theme-muted">
                  {status === "error"
                    ? "That verification link is invalid or has expired. Enter your email to get a new one."
                    : "Enter your account email and we'll send you a fresh verification link."}
                </p>
              </div>

              {status === "error" && (
                <Alert variant="destructive" className="mb-6 animate-fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Link invalid or expired</AlertTitle>
                </Alert>
              )}

              {resent ? (
                <Alert className="mb-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Check your inbox</AlertTitle>
                  <AlertDescription>
                    If an account exists for that address and still needs verifying, a new link is on
                    its way.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleResend} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="verify-email">Email</Label>
                    <Input
                      id="verify-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={resending}
                      className="h-11 transition-shadow"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-11 w-full text-base shadow-md shadow-indigo-600/20"
                    disabled={resending}
                  >
                    {resending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send verification link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              <Link
                href="/login"
                className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-theme-muted transition-colors hover:text-theme"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
