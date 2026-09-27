import { Activity, Boxes, Layers3, MapPinned, ScanSearch, Sparkles } from "lucide-react";

import { MineGroundTruthPanel } from "@/components/dashboard/MineGroundTruthPanel";
import { Panel } from "@/components/dashboard/Panel";
import { ProspectivityExplorer } from "@/components/dashboard/ProspectivityExplorer";
import { AnalysisMetric } from "@/components/layout/AnalysisMetric";
import { HeroBadge, PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/context/use-dashboard";
import { formatScore } from "@/lib/format";

const GUIDE = [
  {
    step: "01",
    title: "Start with the map",
    description:
      "Use the overlay to see where mapped host lithology and lineaments meet the mine area.",
    icon: MapPinned,
  },
  {
    step: "02",
    title: "Check satellite signals",
    description:
      "Open Spectral Layers to compare iron oxide, alteration and topographic lineaments.",
    icon: Layers3,
  },
  {
    step: "03",
    title: "Read confidence last",
    description: "A high score with a narrow confidence interval is stronger than a score alone.",
    icon: Activity,
  },
] as const;

export function ProspectivityPage() {
  const { mine } = useDashboard();
  const confidence = Math.max(0, (1 - mine.prospectivityVariance) * 100);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Geospatial intelligence"
        title={`Read the mineral system around ${mine.label}.`}
        description="Combine geological context, remote-sensing indicators and uncertainty—not just a single score—to understand where further investigation is most defensible."
        icon={MapPinned}
        badges={
          <>
            <HeroBadge tone="teal">Score {formatScore(mine.prospectivityScore)}</HeroBadge>
            <HeroBadge>Grid {mine.gridResolution}</HeroBadge>
            <HeroBadge>{mine.beltName}</HeroBadge>
            <HeroBadge tone="amber">Overlay geometry: simulated</HeroBadge>
          </>
        }
      />

      <section
        aria-label="Prospectivity indicators"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AnalysisMetric
          label="Prospectivity score"
          provenance="simulated"
          value={formatScore(mine.prospectivityScore)}
          description="Relative model score from 0 to 1; higher values indicate stronger combined evidence."
          icon={ScanSearch}
          tone="teal"
          progress={mine.prospectivityScore * 100}
        />
        <AnalysisMetric
          label="Confidence proxy"
          provenance="modelled"
          value={`${confidence.toFixed(0)}%`}
          description={`Calculated from bootstrap variance ±${formatScore(mine.prospectivityVariance)}.`}
          icon={Activity}
          tone="violet"
          progress={confidence}
        />
        <AnalysisMetric
          label="Spectral indicators"
          provenance="simulated"
          value={String(mine.spectralLayers.length)}
          description="Independent surface indicators available for cross-checking this site."
          icon={Layers3}
          tone="amber"
        />
        <AnalysisMetric
          label="Mapped beacons"
          provenance="simulated"
          value={String(mine.mapBeacons.length)}
          description="Operational or prospectivity points shown around the active mine."
          icon={Sparkles}
          tone="sky"
        />
      </section>

      <ProspectivityExplorer expanded />

      <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel
          title="A Simple Reading Order"
          provenance={null}
          description="Three steps for non-specialists reviewing the evidence."
        >
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
                      STEP {item.step}
                    </span>
                    <strong className="mt-0.5 block text-xs text-foreground">{item.title}</strong>
                    <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">
            <Boxes className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            This workspace supports screening and interpretation. It is not a substitute for field
            mapping, drilling or a competent-person estimate.
          </p>
        </Panel>
        <MineGroundTruthPanel />
      </section>
    </div>
  );
}
