"use client";

import { cn } from "@/lib/utils";
import { localeLabels, locales, type Locale } from "@/lib/i18n/types";
import { useLocale } from "@/components/providers/locale-provider";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--muted)] p-0.5",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={cn(
            "rounded-md px-2 py-1 text-[10px] font-bold tracking-wide transition-all",
            locale === loc
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
