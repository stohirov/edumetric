"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { certificatesApi, ApiError } from "@/lib/api";
import type { CertificateVerificationDto } from "@/types/api";

function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.details?.join(", ") ?? e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

function VerifyInner() {
  const params = useSearchParams();
  const initial = params.get("code") ?? "";
  const [code, setCode] = useState(initial);
  const [result, setResult] = useState<CertificateVerificationDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await certificatesApi.verifyCertificate(trimmed));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  // Auto-verify a code arriving via ?code= — state is set only inside the async
  // callback (after await), never synchronously in the effect body.
  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) setLoading(true);
      try {
        const r = await certificatesApi.verifyCertificate(initial.trim());
        if (!cancelled) setResult(r);
      } catch (e) {
        if (!cancelled) setError(errMsg(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <Award className="mx-auto h-10 w-10 text-indigo-600" />
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Verify a certificate
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter a certificate code to confirm it was issued by EduMetric.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="flex gap-2"
      >
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. EM-AB12CD34EF"
          className="font-mono"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Verify"}
        </Button>
      </form>

      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {result &&
        (result.valid ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              Valid certificate
            </div>
            <dl className="mt-3 space-y-1 text-sm text-emerald-900">
              <div className="flex gap-2">
                <dt className="w-28 text-emerald-700">Student</dt>
                <dd className="font-medium">{result.studentName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-emerald-700">Course</dt>
                <dd className="font-medium">{result.courseName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-emerald-700">Completed</dt>
                <dd className="font-medium">
                  {result.completedAt
                    ? new Date(result.completedAt).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 text-emerald-700">Code</dt>
                <dd className="font-mono">{result.certificateCode}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
            <XCircle className="h-5 w-5" />
            No certificate found for this code.
          </div>
        ))}
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
