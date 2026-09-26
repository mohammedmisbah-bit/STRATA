import { useContext } from "react";

import { LanguageContext, type LanguageContextValue } from "./language-context";

/**
 * Reads the active language.
 *
 * Falls back to a static English value instead of throwing, so a component can
 * be rendered outside `<LanguageProvider>` without taking the page down — the
 * worst case is untranslated copy, which is exactly the graceful degradation
 * this feature is supposed to have.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === null) {
    return { language: "en", setLanguage: () => undefined, isHydrated: false };
  }
  return context;
}
