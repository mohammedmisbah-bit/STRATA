import { Languages } from "lucide-react";

import { useLanguage } from "@/context/use-language";
import { cn } from "@/lib/utils";
import { LANGUAGE_META, SUPPORTED_LANGUAGES } from "@/services/translationService";

/** Global EN / HI / MR preference with native endonyms in tooltips. */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Languages className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div
        role="group"
        aria-label="Interface language"
        className="flex items-center gap-0.5 rounded-xl border border-border bg-secondary/80 p-1 shadow-inner"
      >
        {SUPPORTED_LANGUAGES.map((code) => {
          const meta = LANGUAGE_META[code];
          const isActive = language === code;

          return (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              aria-pressed={isActive}
              title={`${meta.label} · ${meta.endonym}`}
              className={cn(
                "min-w-9 rounded-lg px-2 py-1.5 text-[9px] font-extrabold tracking-[0.08em] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive
                  ? "bg-[#0b3940] text-white shadow-[0_5px_14px_-7px_rgba(15,118,110,0.8)]"
                  : "text-slate-500 hover:bg-card hover:text-foreground",
              )}
            >
              {meta.short}
              <span className="sr-only"> — {meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
