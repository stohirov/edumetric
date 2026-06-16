"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useT } from "@/components/providers/locale-provider";
import { useAuth, roleHomePath } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api";
import type { UserRole } from "@/types";
import type { UserDto } from "@/types/api";

type FormError = {
  title: string;
  message: string;
} | null;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginFormCard() {
  const router = useRouter();
  const t = useT();
  const demoAccounts = useMemo(
    () => [
      {
        role: "admin" as const,
        label: t.login.demo.admin,
        email: "admin@edumetric.io",
        icon: Shield,
        description: t.login.demo.adminDesc,
      },
      {
        role: "teacher" as const,
        label: t.login.demo.teacher,
        email: "teacher@edumetric.io",
        icon: GraduationCap,
        description: t.login.demo.teacherDesc,
      },
      {
        role: "student" as const,
        label: t.login.demo.student,
        email: "student@edumetric.io",
        icon: BookOpen,
        description: t.login.demo.studentDesc,
      },
    ],
    [t],
  );
  const { login, verifyTwoFactor } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<UserRole | null>(null);
  const [error, setError] = useState<FormError>(null);
  const [shake, setShake] = useState(false);
  // When set, the password step succeeded but 2FA is required: show the code step.
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const triggerError = (title: string, message: string) => {
    setError({ title, message });
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const clearError = () => {
    if (error) setError(null);
  };

  const redirectAfterLogin = (user: UserDto) => {
    router.push(user.mustChangePassword ? "/change-password" : roleHomePath(user.role));
  };

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    const result = await login(loginEmail, loginPassword);
    if (result.mfaRequired) {
      // Hand off to the 2FA code step; clear loading so the form is interactive.
      setMfaToken(result.mfaToken);
      setIsLoading(false);
      setLoadingDemo(null);
      return;
    }
    redirectAfterLogin(result.user);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!mfaCode.trim()) {
      triggerError("Code required", "Enter the 6-digit code from your authenticator app.");
      return;
    }
    setIsLoading(true);
    try {
      const user = await verifyTwoFactor(mfaToken!, mfaCode.trim());
      redirectAfterLogin(user);
    } catch (err) {
      setIsLoading(false);
      handleApiError(err);
    }
  };

  const cancelMfa = () => {
    setMfaToken(null);
    setMfaCode("");
    setIsLoading(false);
    clearError();
  };

  const handleApiError = (err: unknown) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        triggerError(
          t.login.errors.wrongCredentials,
          t.login.errors.wrongCredentialsMsg,
        );
        return;
      }
      if (err.status === 423) {
        triggerError("Account locked", err.message);
        return;
      }
      if (err.status === 0) {
        triggerError("Network error", err.message);
        return;
      }
      triggerError(t.login.errors.wrongCredentials, err.message);
      return;
    }
    triggerError(
      t.login.errors.wrongCredentials,
      t.login.errors.wrongCredentialsMsg,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim()) {
      triggerError(
        t.login.errors.emailRequired,
        t.login.errors.emailRequiredMsg,
      );
      return;
    }

    if (!validateEmail(email)) {
      triggerError(
        t.login.errors.invalidEmail,
        t.login.errors.invalidEmailMsg,
      );
      return;
    }

    if (!password) {
      triggerError(
        t.login.errors.passwordRequired,
        t.login.errors.passwordRequiredMsg,
      );
      return;
    }

    setIsLoading(true);
    try {
      await performLogin(email.trim(), password);
    } catch (err) {
      setIsLoading(false);
      handleApiError(err);
    }
  };

  const handleDemoLogin = async (account: (typeof demoAccounts)[0]) => {
    clearError();
    setLoadingDemo(account.role);
    setEmail(account.email);
    setPassword("demo123");
    try {
      await performLogin(account.email, "demo123");
    } catch (err) {
      setLoadingDemo(null);
      handleApiError(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[420px] animate-fade-in">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div
          className={cn(
            "card-surface rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-elevated)] transition-all duration-300",
            shake && "login-shake",
          )}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-theme">
              {t.login.welcomeBack}
            </h2>
            <p className="mt-2 text-sm text-theme-muted">{t.login.subtitle}</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{error.title}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {mfaToken ? (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Authentication code</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="123456 or backup code"
                  value={mfaCode}
                  onChange={(e) => {
                    setMfaCode(e.target.value);
                    clearError();
                  }}
                  disabled={isLoading}
                  className="h-11 tracking-widest"
                />
                <p className="text-xs text-theme-muted">
                  Enter the 6-digit code from your authenticator app, or a backup code.
                </p>
              </div>
              <Button
                type="submit"
                className="h-11 w-full text-base shadow-md shadow-indigo-600/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={cancelMfa}
                disabled={isLoading}
                className="w-full text-center text-xs font-medium text-theme-muted transition-colors hover:text-theme"
              >
                Back to sign in
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t.login.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t.login.emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                disabled={isLoading || !!loadingDemo}
                className={cn(
                  "h-11 transition-shadow",
                  error &&
                    "border-red-300 focus-visible:ring-red-400 dark:border-red-800 dark:focus-visible:ring-red-500/60",
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.login.password}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400"
                >
                  {t.login.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  disabled={isLoading || !!loadingDemo}
                  className={cn(
                    "h-11 pr-10 transition-shadow",
                    error &&
                    "border-red-300 focus-visible:ring-red-400 dark:border-red-800 dark:focus-visible:ring-red-500/60",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted transition-colors hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? t.login.hidePassword : t.login.showPassword
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

            <Button
              type="submit"
              className="h-11 w-full text-base shadow-md shadow-indigo-600/20"
              disabled={isLoading || !!loadingDemo}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.login.signingIn}
                </>
              ) : (
                <>
                  {t.login.signIn}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          )}

          {!mfaToken && (
          <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-theme" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--card)] px-3 font-medium tracking-wider text-theme-muted">
                {t.login.demoAccounts}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              const isActive = loadingDemo === account.role;

              return (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoLogin(account)}
                  disabled={isLoading || !!loadingDemo}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl border border-theme bg-slate-50/50 px-4 py-3 text-left transition-all duration-200",
                    "hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm hover:border-indigo-300/50 hover:bg-indigo-500/10 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    isActive && "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--card)] shadow-sm transition-colors",
                      "group-hover:bg-indigo-100",
                    )}
                  >
                    {isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    ) : (
                      <Icon className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-theme">
                      {t.login.continueAs} {account.label}
                    </p>
                    <p className="truncate text-xs text-theme-muted">{account.email}</p>
                  </div>
                  <span className="hidden text-[10px] font-medium text-theme-muted sm:block">
                    {account.description}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-theme-muted">
            {t.login.demoPassword}:{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 font-mono text-theme">
              demo123
            </code>
          </p>
          </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-theme-muted">
          {t.login.agree}{" "}
          <Link
            href="#"
            className="text-theme-muted underline-offset-2 hover:text-theme hover:underline"
          >
            {t.login.terms}
          </Link>{" "}
          {t.login.and}{" "}
          <Link
            href="#"
            className="text-theme-muted underline-offset-2 hover:text-theme hover:underline"
          >
            {t.login.privacy}
          </Link>
        </p>
      </div>
    </div>
  );
}
