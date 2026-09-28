import { Activity, Boxes, Layers3, MapPinned, ScanSearch, Sparkles } from "lucide-react";

import { MineGroundTruthPanel } from "@/components/dashboard/MineGroundTruthPanel";
import { Panel } from "@/components/dashboard/Panel";
import { ProspectivityExplorer } from "@/components/dashboard/ProspectivityExplorer";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { useUiText } from "@/i18n/use-ui-text";
import { formatScore } from "@/lib/format";

const GUIDE = [
  { step: "01", key: "1", icon: MapPinned },
  { step: "02", key: "2", icon: Layers3 },
  { step: "03", key: "3", icon: Activity },
] as const;

export function ProspectivityPage() {
  const { mine } = useDashboard();
  const t = useUiText();
  const confidence = Math.max(0, (1 - mine.prospectivityVariance) * 100);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow={t("nav.prospectivity.eyebrow")}
        title={t("pros.title", { mine: mine.label })}
        description={t("pros.desc")}
        icon={MapPinned}
        badges={
          <>
            <HeroBadge tone="teal">
              {t("pros.score", { score: formatScore(mine.prospectivityScore) })}
            </HeroBadge>
            <HeroBadge>{t("pros.grid", { grid: mine.gridResolution })}</HeroBadge>
            <HeroBadge>{mine.beltName}</HeroBadge>
            <HeroBadge tone="amber">{t("pros.overlaySimulated")}</HeroBadge>
          </>
        }
      />

      <section aria-label={t("pros.m.score")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalysisMetric
          label={t("pros.m.score")}
          provenance="simulated"
          value={formatScore(mine.prospectivityScore)}
          description={t("pros.m.scoreDesc")}
          icon={ScanSearch}
          tone="teal"
          progress={mine.prospectivityScore * 100}
        />
        <AnalysisMetric
          label={t("pros.m.confidence")}
          provenance="modelled"
          value={`${confidence.toFixed(0)}%`}
          description={t("pros.m.confidenceDesc", {
            variance: formatScore(mine.prospectivityVariance),
          })}
          icon={Activity}
          tone="violet"
          progress={confidence}
        />
        <AnalysisMetric
          label={t("pros.m.spectral")}
          provenance="simulated"
          value={String(mine.spectralLayers.length)}
          description={t("pros.m.spectralDesc")}
          icon={Layers3}
          tone="amber"
        />
        <AnalysisMetric
          label={t("pros.m.beacons")}
          provenance="simulated"
          value={String(mine.mapBeacons.length)}
          description={t("pros.m.beaconsDesc")}
          icon={Sparkles}
          tone="sky"
        />
      </section>

      <ProspectivityExplorer expanded />

      <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel title={t("pros.guide.title")} provenance={null} description={t("pros.guide.desc")}>
          <ol className="space-y-3">
            {GUIDE.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.step}
                  className="flex gap-3 rounded-xl border border-border/70 bg-slate-50/70 p-3.5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#0b3940] text-teal-200 shadow-sm">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="font-mono text-[9px] font-bold tracking-[0.14em] text-teal">
                      {t("common.step")} {item.step}
                    </span>
                    <strong className="mt-0.5 block text-xs text-foreground">
                      {t(`pros.guide.${item.key}.title`)}
                    </strong>
                    <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                      {t(`pros.guide.${item.key}.desc`)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">
            <Boxes className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {t("pros.disclaimer")}
          </p>
        </Panel>
        <MineGroundTruthPanel />
      </section>
    </div>
  );
}
