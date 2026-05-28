"use client";

import { Loader2, AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Loading…", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-theme-muted",
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Couldn’t load data",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-red-200/60 bg-red-50/30 p-8 text-center",
        className,
      )}
    >
      <AlertCircle className="h-6 w-6 text-red-500" />
      <h3 className="text-base font-semibold text-theme">{title}</h3>
      {message && <p className="text-sm text-theme-muted">{message}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-1 gap-1.5">
          <RotateCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function EmptyState({
  title = "Nothing to show yet",
  message,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center text-theme-muted",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-theme">{title}</h3>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
