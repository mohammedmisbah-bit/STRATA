import { Languages } from "lucide-react";

import { useLanguage } from "@/context/use-language";
import { LANGUAGE_META, SUPPORTED_LANGUAGES } from "@/services/translationService";
import { cn } from "@/lib/utils";

/**
 * Compact EN | HI | MR pill group.
 *
 * Modelled as a group of toggle buttons rather than a tablist: these do not
 * reveal panels, they change a global setting, so `aria-pressed` is the correct
 * semantic and every button stays in the tab order.
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <Languages className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div
        role="group"
        aria-label="Interface language"
        className="flex items-center gap-0.5 rounded-full border border-slate-line bg-secondary p-0.5"
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
                "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isActive
                  ? "bg-teal text-primary-foreground shadow-sm"
                  : "text-slate-600 hover:bg-card hover:text-foreground",
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
