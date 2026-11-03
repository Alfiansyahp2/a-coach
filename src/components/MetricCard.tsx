import React from "react";

interface MetricCardProps {
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

  const progressPct = targetProgress
    ? Math.min(100, Math.round((targetProgress.current / Math.max(1, targetProgress.target)) * 100))
    : null;

  return (
    <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs transition-colors duration-200 flex flex-col justify-between">
      {/* Label and Delta */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider font-mono font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
        {delta && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
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

      {/* Main Metric Value & Unit */}
      <div className="my-2.5 flex items-baseline gap-1.5">
        <span
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono font-tabular ${
            accentColorStyles[accentColor] || accentColorStyles.default
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-[var(--color-text-muted)]">
            {unit}
          </span>
        )}
      </div>

      {/* Target Progress Bar */}
      {targetProgress && progressPct !== null && (
        <div className="space-y-1 mb-2">
          <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                accentProgressStyles[accentColor] || accentProgressStyles.default
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
            <span>Progress: {progressPct}%</span>
            <span>Target: {targetProgress.target} km</span>
          </div>
        </div>
      )}

      {/* Subtext Note */}
      {subtext && (
        <p className="text-[11px] font-mono text-[var(--color-text-muted)] line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
