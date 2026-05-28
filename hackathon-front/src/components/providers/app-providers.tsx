"use client";

import { AosProvider } from "@/components/providers/aos-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Locale } from "@/lib/i18n/types";

export function AppProviders({
  children,
  initialLocale = "uz",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <ThemeProvider>
      <LocaleProvider initialLocale={initialLocale}>
        <AuthProvider>
          <AosProvider>{children}</AosProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
