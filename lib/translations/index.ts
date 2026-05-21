import { ar } from "./ar";
import { en } from "./en";

export type Locale = "ar" | "en";

export const translations = { ar, en } as const;

// Default locale for Phase 1. The language toggle is a placeholder; only
// Arabic is fully wired up at the moment.
export const defaultLocale: Locale = "ar";

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale];
}

export { ar, en };
