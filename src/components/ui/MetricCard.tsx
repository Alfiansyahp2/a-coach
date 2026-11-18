import React from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    note?: string;
  };
  accentColor?:
    | "volt"
    | "cyan"
    | "amber"
    | "crimson"
    | "default"
    | "endurance"
    | "cycling"
    | "running"
    | "alert"
    | "strava";
  subtext?: string;
  targetProgress?: {
    current: number;
    target: number;
    label?: string;
  };
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  accentColor = "default",
  subtext,
  targetProgress,
}: MetricCardProps) {
  const accentColorStyles: Record<string, string> = {
    volt: "text-[var(--color-endurance)]",
    endurance: "text-[var(--color-endurance)]",
    cyan: "text-[var(--color-cycling)]",
    cycling: "text-[var(--color-cycling)]",
    amber: "text-[var(--color-running)]",
    running: "text-[var(--color-running)]",
    crimson: "text-[var(--color-alert-red)]",
    alert: "text-[var(--color-alert-red)]",
    strava: "text-[var(--color-strava)]",
    default: "text-[var(--color-text-primary)]",
  };

  const accentProgressStyles: Record<string, string> = {
    volt: "bg-[var(--color-endurance)]",
    endurance: "bg-[var(--color-endurance)]",
    cyan: "bg-[var(--color-cycling)]",
    cycling: "bg-[var(--color-cycling)]",
    amber: "bg-[var(--color-running)]",
    running: "bg-[var(--color-running)]",
    crimson: "bg-[var(--color-alert-red)]",
    alert: "bg-[var(--color-alert-red)]",
    strava: "bg-[var(--color-strava)]",
    default: "bg-[var(--color-text-primary)]",
  };

  const accentBorderStyles: Record<string, string> = {
    volt: "border-t-[var(--color-endurance)]",
    endurance: "border-t-[var(--color-endurance)]",
    cyan: "border-t-[var(--color-cycling)]",
    cycling: "border-t-[var(--color-cycling)]",
    amber: "border-t-[var(--color-running)]",
    running: "border-t-[var(--color-running)]",
    crimson: "border-t-[var(--color-alert-red)]",
    alert: "border-t-[var(--color-alert-red)]",
    strava: "border-t-[var(--color-strava)]",
    default: "border-t-[var(--color-border)]",
  };

  const accentStrokeColor: Record<string, string> = {
    volt: "var(--color-endurance)",
    endurance: "var(--color-endurance)",
    cyan: "var(--color-cycling)",
    cycling: "var(--color-cycling)",
    amber: "var(--color-running)",
    running: "var(--color-running)",
    crimson: "var(--color-alert-red)",
    alert: "var(--color-alert-red)",
    strava: "var(--color-strava)",
    default: "var(--color-text-primary)",
  };

  const progressPct = targetProgress
    ? Math.min(100, Math.round((targetProgress.current / Math.max(1, targetProgress.target)) * 100))
    : null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = progressPct !== null ? circumference - (progressPct / 100) * circumference : circumference;

  return (
    <div
      className={`rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 ${
        accentBorderStyles[accentColor] || accentBorderStyles.default
      } shadow-xs hover:border-[var(--color-text-secondary)]/50 transition-all duration-200 flex flex-col justify-between relative overflow-hidden font-mono group`}
    >
      {/* Label and Delta */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
        {delta && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-transform group-hover:scale-105 duration-200 ${
              delta.isNeutral
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                : delta.isPositive
                ? "bg-[var(--color-endurance)]/10 text-[var(--color-endurance)] border border-[var(--color-endurance)]/30"
                : "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30"
            }`}
          >
            {delta.value}
          </span>
        )}
      </div>

      {/* Main Metric Value & Unit with Optional Radial Progress Dial */}
      <div className="my-2 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-tabular ${
              accentColorStyles[accentColor] || accentColorStyles.default
            }`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {unit}
            </span>
          )}
        </div>

        {/* Circular Telemetry Dial Gauge (Instrument-Grade) */}
        {targetProgress && progressPct !== null && (
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center" title={`Progress: ${progressPct}% menuju target ${targetProgress.target} km`}>
            <svg className="w-11 h-11 -rotate-90 origin-center" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-[var(--color-surface-muted)] fill-none"
                strokeWidth="3.5"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                stroke={accentStrokeColor[accentColor] || accentStrokeColor.default}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="fill-none transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black font-tabular text-[var(--color-text-primary)]">
              {progressPct}%
            </span>
          </div>
        )}
      </div>

      {/* Target Progress Bar (Linear Hairline) */}
      {targetProgress && progressPct !== null && (
        <div className="space-y-1 mb-2">
          <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                accentProgressStyles[accentColor] || accentProgressStyles.default
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
            <span>Progress: {progressPct}%</span>
            <span>Target: {targetProgress.target} km</span>
          </div>
        </div>
      )}

      {/* Subtext Note */}
      {subtext && (
        <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
}

export default MetricCard;
