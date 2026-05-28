import type { uz } from "./dictionaries/uz";

export type Locale = "uz" | "ru" | "en";

type Stringify<T> = {
  [K in keyof T]: T[K] extends object ? Stringify<T[K]> : string;
};

export type Dictionary = Stringify<typeof uz>;

export const locales: Locale[] = ["uz", "ru", "en"];

export const localeLabels: Record<Locale, string> = {
  uz: "OʻZB",
  ru: "РУС",
  en: "ENG",
};

export const LOCALE_COOKIE = "edumetric-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "uz" || value === "ru" || value === "en";
}
