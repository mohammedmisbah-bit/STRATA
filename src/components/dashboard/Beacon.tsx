import type { BeaconTone } from "@/lib/mine-data";

const TONE_CLASSES: Record<BeaconTone, { ping: string; core: string }> = {
  rose: { ping: "bg-rose-400", core: "bg-rose-500" },
  emerald: { ping: "bg-emerald-400", core: "bg-emerald-500" },
  amber: { ping: "bg-amber-400", core: "bg-amber-500" },
};

/**
 * Pulsing status dot. Decorative — the adjacent label carries the meaning, so
 * this is hidden from assistive tech.
 */
export function Beacon({ tone = "emerald" }: { tone?: BeaconTone | undefined }) {
  const classes = TONE_CLASSES[tone] ?? TONE_CLASSES.emerald;

  return (
    <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${classes.ping}`}
      />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${classes.core}`} />
    </span>
  );
}
