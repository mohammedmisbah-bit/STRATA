import { createContext } from "react";

import type { LanguageCode } from "@/services/translationService";

export type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: unknown) => void;
  /** True once the persisted preference has been read on the client. */
  isHydrated: boolean;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LANGUAGE_STORAGE_KEY = "moil.language.v1";
