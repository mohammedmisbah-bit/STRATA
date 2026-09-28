import { Layers } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import type { SpectralTone } from "@/lib/mine-data";
import { cn } from "@/lib/utils";

const READING_CLASSES: Record<SpectralTone, string> = {
  ochre: "bg-amber-50 text-amber-800 border-amber-200",
  teal: "bg-teal-soft text-teal border-teal/30",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
};

export function SpectralView() {
  const { mine } = useDashboard();
  const t = useUiText();

  if (mine.spectralLayers.length === 0) {
    return (
      <div className="grid h-full min-h-[340px] place-items-center rounded-md border border-dashed border-border bg-panel-grid text-xs text-muted-foreground">
        {t("spectral.empty", { mine: mine.label })}
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-[340px] gap-3 md:grid-cols-3">
      {mine.spectralLayers.map((layer) => (
        <article
          key={layer.id}
          className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm lift-card"
        >
          <div className="flex items-center gap-2">
            <Layers className="size-4 shrink-0 text-teal" aria-hidden="true" />
            <h3 className="text-sm font-semibold">{layer.title}</h3>
          </div>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {layer.source}
          </p>
          <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
            {layer.description}
          </p>
          <span
            className={cn(
              "mt-3 self-start rounded-md border px-2 py-1 font-mono text-[11px] font-semibold",
              READING_CLASSES[layer.tone] ?? READING_CLASSES.slate,
            )}
          >
            {layer.reading}
          </span>
        </article>
      ))}
    </div>
  );
}
