import { cn } from "@/lib/utils";

import { PANEL_HOVER } from "./Panel";

/**
 * Accessible range control.
 *
 * The visible label is bound to the input via `htmlFor`/`id`, and
 * `aria-valuetext` gives screen readers the value with its unit rather than a
 * bare number.
 */
export function ScenarioSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  accentColor,
  valueClassName,
  contributionLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number | undefined;
  unit: string;
  accentColor: string;
  valueClassName?: string | undefined;
  contributionLabel?: string | undefined;
  onChange: (value: number) => void;
}) {
  const span = max - min;
  const fillPct = span > 0 ? ((value - min) / span) * 100 : 0;

  return (
    <div className={cn("rounded-md border border-border p-2.5", PANEL_HOVER)}>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-[11px] font-medium">
        <label htmlFor={id}>
          {label}{" "}
          <span className="text-muted-foreground">
            ({min}–{max} {unit})
          </span>
        </label>
        <span className="flex items-baseline gap-2">
          {contributionLabel ? (
            <span className="font-mono text-[10px] text-muted-foreground">{contributionLabel}</span>
          ) : null}
          <span className={cn("font-mono", valueClassName)}>
            {value} {unit}
          </span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value} ${unit}`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        style={{
          accentColor,
          background: `linear-gradient(to right, ${accentColor} ${fillPct}%, var(--slate-line) ${fillPct}%)`,
        }}
      />
    </div>
  );
}
