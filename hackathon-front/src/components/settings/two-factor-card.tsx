"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";

type Stage = "idle" | "enrolling" | "showingCodes";

export function TwoFactorCard() {
  const { user, refresh } = useAuth();
  const [stage, setStage] = useState<Stage>("idle");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;
  const enabled = user.twoFactorEnabled;

  const fail = (e: unknown, fallback: string) =>
    setError(e instanceof ApiError ? (e.details?.join(", ") ?? e.message) : fallback);

  const beginSetup = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await authApi.setupTwoFactor();
      setSecret(res.secret);
      setQrDataUrl(await QRCode.toDataURL(res.otpauthUri, { margin: 1, width: 200 }));
      setCode("");
      setStage("enrolling");
    } catch (e) {
      fail(e, "Failed to start two-factor setup");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async () => {
    if (!code.trim()) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await authApi.enableTwoFactor(code.trim());
      setBackupCodes(res.backupCodes);
      setStage("showingCodes");
      await refresh();
    } catch (e) {
      fail(e, "Failed to enable two-factor authentication");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (!code.trim()) {
      setError("Enter a current authentication or backup code to disable 2FA.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authApi.disableTwoFactor(code.trim());
      setCode("");
      await refresh();
    } catch (e) {
      fail(e, "Failed to disable two-factor authentication");
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setStage("idle");
    setCode("");
    setSecret("");
    setQrDataUrl("");
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          Add a one-time code from an authenticator app (Google Authenticator, Authy, 1Password)
          as a second step at sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-lg">
        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* Enabled, not mid-flow → status + disable */}
        {enabled && stage !== "showingCodes" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Enabled
              </span>
              <span className="text-sm text-theme-muted">
                Your account is protected with an authenticator app.
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twofa-disable-code">Disable</Label>
              <Input
                id="twofa-disable-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Current code or backup code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="max-w-xs"
              />
              <p className="text-xs text-theme-muted">
                Enter a current code to turn 2FA off.
              </p>
            </div>
            <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={disable}>
              {busy ? "Disabling…" : "Disable 2FA"}
            </Button>
          </div>
        ) : null}

        {/* Disabled, idle → start */}
        {!enabled && stage === "idle" ? (
          <Button type="button" size="sm" disabled={busy} onClick={beginSetup}>
            {busy ? "Starting…" : "Set up 2FA"}
          </Button>
        ) : null}

        {/* Enrolling → QR + verify */}
        {stage === "enrolling" ? (
          <div className="space-y-4">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-theme">
              <li>Scan this QR code with your authenticator app.</li>
              <li>Enter the 6-digit code it shows to confirm.</li>
            </ol>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="2FA QR code"
                className="rounded-md border border-theme bg-white p-2"
                width={200}
                height={200}
              />
            ) : null}
            <div className="space-y-1">
              <span className="text-xs text-theme-muted">Or enter this key manually:</span>
              <code className="block break-all rounded bg-[var(--muted)] px-2 py-1 font-mono text-xs text-theme">
                {secret}
              </code>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twofa-confirm-code">Verification code</Label>
              <Input
                id="twofa-confirm-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="max-w-xs tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={busy} onClick={confirmEnable}>
                {busy ? "Verifying…" : "Verify & enable"}
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={cancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {/* Just enabled → show one-time backup codes */}
        {stage === "showingCodes" ? (
          <div className="space-y-3">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Save these backup codes somewhere safe. Each can be used once if you lose access to
              your authenticator. They won&apos;t be shown again.
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {backupCodes.map((c) => (
                <li
                  key={c}
                  className="rounded bg-[var(--muted)] px-2 py-1 text-center font-mono text-sm text-theme"
                >
                  {c}
                </li>
              ))}
            </ul>
            <Button type="button" size="sm" onClick={cancel}>
              Done
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
