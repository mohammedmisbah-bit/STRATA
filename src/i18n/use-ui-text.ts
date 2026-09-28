import { useCallback } from "react";

import { useLanguage } from "@/context/use-language";

import { formatUiString, type UiKey, type UiVars } from "./ui-strings";

export type UiTranslate = (key: UiKey, vars?: UiVars) => string;

/**
 * Returns `t(key, vars)` bound to the current interface language.
 *
 * Hydration-safe: LanguageProvider always renders English on the server and on
 * the first client pass, then adopts the stored preference in an effect, so
 * both render passes produce identical markup.
 */
export function useUiText(): UiTranslate {
  const { language } = useLanguage();
  return useCallback((key, vars) => formatUiString(language, key, vars), [language]);
}
