import { useEffect, useMemo, useRef, useState } from "react";

import { useLanguage } from "@/context/use-language";
import { translateBatch } from "@/services/translationService";

export type TranslationStatus = "idle" | "loading" | "ready" | "partial" | "fallback";

export type UseTranslatedTexts = {
  /** Returns the translation if available, otherwise the original string. */
  t: (source: string) => string;
  status: TranslationStatus;
  /** True while a request is in flight — use it to fade, not to hide. */
  isTranslating: boolean;
  /** True when at least one string could not be translated. */
  hasFallback: boolean;
  /** True when MyMemory's free quota or throttle caused the fallback. */
  isRateLimited: boolean;
};

const IDENTITY: UseTranslatedTexts = {
  t: (source) => source,
  status: "idle",
  isTranslating: false,
  hasFallback: false,
  isRateLimited: false,
};

/**
 * Translates a set of strings into the active language.
 *
 * Client-only: the effect never runs during SSR, so the server always emits the
 * English source and hydration matches. Translations then swap in.
 *
 * `sources` is compared by content, not identity, so callers can pass a freshly
 * built array each render without causing a fetch loop.
 */
export function useTranslatedTexts(sources: readonly string[]): UseTranslatedTexts {
  const { language } = useLanguage();

  // Stable content key — a new array with the same strings must not refetch.
  const sourceKey = useMemo(() => JSON.stringify([...sources]), [sources]);
  const sourceList = useMemo(() => JSON.parse(sourceKey) as string[], [sourceKey]);

  const [state, setState] = useState<{
    language: string;
    entries: Record<string, string>;
    hasFallback: boolean;
    isRateLimited: boolean;
  }>({ language: "en", entries: {}, hasFallback: false, isRateLimited: false });

  const [isTranslating, setIsTranslating] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (language === "en" || sourceList.length === 0) {
      setIsTranslating(false);
      setState({ language, entries: {}, hasFallback: false, isRateLimited: false });
      return;
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsTranslating(true);

    void translateBatch(sourceList, language, { signal: controller.signal }).then((result) => {
      // Ignore a resolved response that a newer request has superseded.
      if (controller.signal.aborted || requestIdRef.current !== requestId) return;
      setState({
        language,
        entries: result.entries,
        hasFallback: result.anyFallback,
        isRateLimited: result.rateLimited,
      });
      setIsTranslating(false);
    });

    return () => {
      controller.abort();
    };
  }, [language, sourceList]);

  const result = useMemo<UseTranslatedTexts>(() => {
    if (language === "en") return IDENTITY;

    const isCurrent = state.language === language;
    const entries = isCurrent ? state.entries : {};
    const resolved = Object.keys(entries).length > 0;

    let status: TranslationStatus;
    if (isTranslating && !resolved) {
      status = "loading";
    } else if (!resolved) {
      status = "idle";
    } else if (state.isRateLimited || (state.hasFallback && !resolved)) {
      status = "fallback";
    } else if (state.hasFallback) {
      status = "partial";
    } else {
      status = "ready";
    }

    return {
      t: (source: string) => entries[source] ?? source,
      status,
      isTranslating,
      hasFallback: isCurrent && state.hasFallback,
      isRateLimited: isCurrent && state.isRateLimited,
    };
  }, [language, state, isTranslating]);

  return result;
}

export type UseTranslatedText = Omit<UseTranslatedTexts, "t"> & {
  /** The translated string, or the original while loading or on failure. */
  text: string;
};

/**
 * Single-string convenience wrapper over {@link useTranslatedTexts}.
 *
 * Accepts `null`/`undefined` so a caller can hold nothing yet — useful for
 * AI-generated copy that only exists after a button press — without violating
 * the rules of hooks by conditionally calling it.
 */
export function useTranslatedText(source: string | null | undefined): UseTranslatedText {
  const sources = useMemo(
    () => (typeof source === "string" && source.trim().length > 0 ? [source] : []),
    [source],
  );

  const { t, status, isTranslating, hasFallback, isRateLimited } = useTranslatedTexts(sources);

  return {
    text: typeof source === "string" ? t(source) : "",
    status,
    isTranslating,
    hasFallback,
    isRateLimited,
  };
}
