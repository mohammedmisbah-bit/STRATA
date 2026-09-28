import { Languages } from "lucide-react";

import { useLanguage } from "@/context/use-language";
import { useUiText } from "@/i18n/use-ui-text";
import { cn } from "@/lib/utils";
import { LANGUAGE_META, SUPPORTED_LANGUAGES } from "@/services/translationService";

/**
 * Global EN / HI / MR preference.
 *
 * The active pill slides between options on a transform (GPU) track instead of
 * re-painting each button's background, so switching feels instant.
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const t = useUiText();
  const activeIndex = Math.max(0, SUPPORTED_LANGUAGES.indexOf(language));

  return (
    <div className="flex items-center gap-2">
      <Languages className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div
        role="group"
        aria-label={t("shell.language")}
        className="relative grid grid-cols-3 rounded-xl border border-border bg-secondary/80 p-1 shadow-inner"
      >
        <span
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-[#0b3940] shadow-[0_5px_14px_-7px_rgba(15,118,110,0.8)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
          aria-hidden="true"
        />
        {SUPPORTED_LANGUAGES.map((code) => {
          const meta = LANGUAGE_META[code];
          const isActive = language === code;

          return (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              aria-pressed={isActive}
              lang={code}
              title={`${meta.label} · ${meta.endonym}`}
              className={cn(
                "relative z-10 min-w-9 rounded-lg px-2 py-1.5 text-[9px] font-extrabold tracking-[0.08em] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive ? "text-white" : "text-slate-500 hover:text-foreground",
              )}
            >
              {meta.short}
              <span className="sr-only"> — {meta.endonym}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
