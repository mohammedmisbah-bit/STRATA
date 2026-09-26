import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { isLanguageCode, type LanguageCode } from "@/services/translationService";

import {
  LANGUAGE_STORAGE_KEY,
  LanguageContext,
  type LanguageContextValue,
} from "./language-context";

/**
 * App-wide language state.
 *
 * Deliberately separate from DashboardContext: language is an i18n concern, and
 * folding it in would invalidate the scenario memo on every language switch,
 * recomputing the whole simulation to change some label text.
 *
 * Always starts at `en` and adopts the stored preference in an effect. Reading
 * localStorage during render would make the server and client markup disagree.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isLanguageCode(stored)) setLanguageState(stored);
    } catch {
      // Private mode or blocked storage; the default stands.
    }
  }, []);

  const setLanguage = useCallback((code: unknown) => {
    if (!isLanguageCode(code)) return;
    setLanguageState(code);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // Preference simply will not persist.
    }
  }, []);

  // Keeps screen readers and the browser's own language heuristics in step.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, isHydrated }),
    [language, setLanguage, isHydrated],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
