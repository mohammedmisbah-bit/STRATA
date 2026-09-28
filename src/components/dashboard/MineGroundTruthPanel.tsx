import { BadgeCheck, Compass, Layers3, Mountain, Ruler } from "lucide-react";

import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatLatitude, formatLongitude } from "@/lib/format";
import { MOIL_OFFICIAL_SOURCE } from "@/lib/mine-data";

import { Panel } from "./Panel";
import { ProvenanceBadge, type Provenance } from "./ProvenanceBadge";

export function MineGroundTruthPanel() {
  const { mine } = useDashboard();
  const t = useUiText();

  // Only mines actually tagged with the MOIL filing source earn the Official
  // badge. A Supabase-only mine arrives as "Unverified" and is labelled so.
  const filed: Provenance = mine.officialSource === MOIL_OFFICIAL_SOURCE ? "official" : "simulated";

  const facts: Array<{
    label: string;
    value: string;
    detail: string;
    icon: typeof Ruler;
    provenance: Provenance;
  }> = [
    {
      label: t("gt.depth"),
      value: `~${mine.depthMeters} m`,
      detail: mine.type === "opencast" ? t("gt.opencast") : t("gt.underground"),
      icon: Ruler,
      provenance: filed,
    },
    {
      label: t("gt.ore"),
      value: mine.oreProfile,
      detail: mine.beltName,
      icon: Layers3,
      provenance: filed,
    },
    {
      label: t("gt.setting"),
      value: `${mine.district}, ${mine.state}`,
      detail: mine.operationalNote ?? t("gt.operation", { type: mine.type }),
      icon: Mountain,
      provenance: filed,
    },
    {
      // Approximate centroids for map placement and weather lookups — not a
      // filed or surveyed position, so deliberately not marked Official.
      label: t("gt.location"),
      value: formatLatitude(mine.coordinates.lat),
      detail: `${formatLongitude(mine.coordinates.lon)} · ${t("gt.centroid")}`,
      icon: Compass,
      provenance: "simulated",
    },
  ];

  return (
    <Panel title={t("gt.title")} provenance={filed} description={t("gt.desc")}>
      <div className="grid gap-2 sm:grid-cols-2">
        {facts.map((fact) => {
          const Icon = fact.icon;
          return (
            <div
              key={fact.label}
              className="rounded-xl border border-border/70 bg-gradient-to-br from-white to-slate-50/80 p-3.5"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-3.5 text-teal" aria-hidden="true" />
                <p className="text-[9px] font-bold uppercase tracking-[0.14em]">{fact.label}</p>
              </div>
              <p className="mt-2 text-[13px] font-bold text-foreground">{fact.value}</p>
              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{fact.detail}</p>
              <ProvenanceBadge kind={fact.provenance} className="mt-2" />
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-xl border border-teal/15 bg-teal-soft/55 px-3 py-2.5 text-[10px] leading-4 text-teal">
        <BadgeCheck className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
        <span>
          <strong>{t("gt.source")}</strong> {mine.officialSource}. {t("gt.depthNote")}
        </span>
      </p>
    </Panel>
  );
}
