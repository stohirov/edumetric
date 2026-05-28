"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  LOCALE_COOKIE,
  type Dictionary,
  type Locale,
  isLocale,
} from "@/lib/i18n/types";

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "uz";
  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  if (isLocale(fromCookie)) return fromCookie;
  const fromStorage = localStorage.getItem(LOCALE_COOKIE);
  if (isLocale(fromStorage)) return fromStorage;
  return "uz";
}

export function LocaleProvider({
  children,
  initialLocale = "uz",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      localStorage.setItem(LOCALE_COOKIE, next);
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
      document.documentElement.lang = next === "uz" ? "uz" : next === "ru" ? "ru" : "en";
      router.refresh();
    },
    [router]
  );

  const t = useMemo(() => getDictionary(mounted ? locale : initialLocale), [locale, mounted, initialLocale]);

  const value = useMemo(
    () => ({ locale: mounted ? locale : initialLocale, t, setLocale }),
    [locale, mounted, initialLocale, t, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT() {
  return useLocale().t;
}
