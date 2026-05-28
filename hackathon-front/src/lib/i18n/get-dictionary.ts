import { en } from "./dictionaries/en";
import { ru } from "./dictionaries/ru";
import { uz } from "./dictionaries/uz";
import type { Dictionary, Locale } from "./types";

const dictionaries: Record<Locale, Dictionary> = { uz, ru, en };

export function getDictionary(locale: Locale = "uz"): Dictionary {
  return dictionaries[locale] ?? uz;
}

export function isLocale(value: string | undefined): value is Locale {
  return value === "uz" || value === "ru" || value === "en";
}
