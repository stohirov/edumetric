"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Header } from "@/components/layout/header";
import { RouteGuard } from "@/components/auth/route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useT } from "@/components/providers/locale-provider";
import { bulkImportApi, ApiError } from "@/lib/api";
import type { BulkImportResultDto } from "@/types/api";

function errorMessage(e: unknown): string {
  return e instanceof ApiError
    ? (e.details?.join(", ") ?? e.message)
    : e instanceof Error
      ? e.message
      : "Something went wrong";
}

interface ImportCardProps {
  title: string;
  description: string;
  columns: string;
  importer: (file: File) => Promise<BulkImportResultDto>;
}

function ImportCard({ title, description, columns, importer }: ImportCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkImportResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await importer(file);
      setResult(res);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-[13px] text-theme-muted">
          Expected CSV columns:{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {columns}
          </code>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="max-w-xs cursor-pointer file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:text-slate-700"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
              setError(null);
            }}
          />
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            <Upload className="h-4 w-4" />
            {loading ? "Uploading…" : "Upload"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-theme">
              <Badge variant="success">{result.created} created</Badge>
              <Badge variant={result.failed > 0 ? "destructive" : "secondary"}>
                {result.failed} failed
              </Badge>
              <span className="text-theme-muted">of {result.total}</span>
            </div>

            {result.errors.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-theme">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50 text-theme-muted dark:bg-slate-800/50">
                    <tr>
                      <th className="px-3 py-2 font-medium">Row</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i} className="border-t border-theme">
                        <td className="px-3 py-2 tabular-nums">{err.row}</td>
                        <td className="px-3 py-2">{err.email}</td>
                        <td className="px-3 py-2 text-red-600">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminImportsPage() {
  const { user } = useAuth();
  const t = useT();

  return (
    <RouteGuard allow={["ADMIN"]}>
      <DashboardShell
        role="admin"
        userName={user?.fullName ?? ""}
        userEmail={user?.email ?? ""}
      >
        <Header
          title={t.nav.imports}
          description="Bulk-create accounts by uploading a CSV file."
        />
        <div className="grid gap-6 p-8 lg:grid-cols-2">
          <ImportCard
            title="Import students"
            description="Each row creates a student account."
            columns="email,fullName,password,groupId,enrolledAt"
            importer={bulkImportApi.importStudents}
          />
          <ImportCard
            title="Import teachers"
            description="Each row creates a teacher account."
            columns="email,fullName,password,department"
            importer={bulkImportApi.importTeachers}
          />
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}
