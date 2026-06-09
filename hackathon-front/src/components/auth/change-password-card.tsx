"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useAuth, roleHomePath } from "@/components/providers/auth-provider";
import { profileApi, ApiError } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;

// Mirrors the backend PasswordPolicy so the user gets instant feedback.
function localPolicyError(password: string): string | null {
  const unmet: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) unmet.push(`at least ${MIN_PASSWORD_LENGTH} characters`);
  if (!/[A-Z]/.test(password)) unmet.push("an uppercase letter");
  if (!/[a-z]/.test(password)) unmet.push("a lowercase letter");
  if (!/\d/.test(password)) unmet.push("a digit");
  return unmet.length ? `Password must contain ${unmet.join(", ")}.` : null;
}

export function ChangePasswordCard() {
  const router = useRouter();
  const { user, refresh, logout } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const policyError = localPolicyError(password);
    if (policyError) {
      setError(policyError);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await profileApi.updateProfile({ password });
      const me = await refresh();
      router.replace(me ? roleHomePath(me.role) : "/login");
    } catch (err) {
      setIsLoading(false);
      if (err instanceof ApiError && err.status === 400) {
        setError(err.message);
      } else {
        setError("Could not update your password. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[420px] animate-fade-in">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="card-surface rounded-2xl p-8 sm:p-10 shadow-[var(--shadow-elevated)]">
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-theme">
              Choose a new password
            </h2>
            <p className="mt-2 text-sm text-theme-muted">
              Your account was set up with a temporary password. Pick a new one to continue
              {user ? ` as ${user.email}` : ""}.
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
              <Label htmlFor="password">New password</Label>
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-theme-muted">
                At least 8 characters, with an uppercase letter, a lowercase letter, and a digit.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
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
                  Saving…
                </>
              ) : (
                <>
                  Set new password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => void logout()}
            className="mt-8 flex w-full items-center justify-center text-sm font-medium text-theme-muted transition-colors hover:text-theme"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
