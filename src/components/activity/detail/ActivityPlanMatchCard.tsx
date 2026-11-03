import React from "react";
import { Layers } from "lucide-react";

interface ActivityPlanMatchCardProps {
  match: any | null;
}

export function ActivityPlanMatchCard({ match }: ActivityPlanMatchCardProps) {
  return (
    <section className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4 font-mono shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--color-cycling)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Calendar Training Reconciliation (Planned vs Actual)
          </h3>
        </div>
        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
          Status:{" "}
          {match ? (
            <span className="text-[var(--color-cycling)] font-semibold">
              Matched with Workout
            </span>
          ) : (
            <span className="text-[var(--color-text-muted)]">Unscheduled / Free Training</span>
          )}
        </span>
      </div>

      {match ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5">
            <div className="text-[var(--color-text-secondary)]">Completion Adherence</div>
            <div className="text-xl font-bold font-tabular text-[var(--color-cycling)]">
              {match.completion_percentage}%
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)]">
              Target planned vs actual distance executed
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5">
            <div className="text-[var(--color-text-secondary)]">Distance Delta</div>
            <div
              className={`text-xl font-bold font-tabular ${
                match.distance_delta_meters >= 0
                  ? "text-[var(--color-cycling)]"
                  : "text-[var(--color-alert-red)]"
              }`}
            >
              {match.distance_delta_meters >= 0 ? "+" : ""}
              {(match.distance_delta_meters / 1000).toFixed(2)} km
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)]">
              Variance against target workout mileage
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5">
            <div className="text-[var(--color-text-secondary)]">Pace Delta</div>
            <div
              className={`text-xl font-bold font-tabular ${
                match.pace_delta_seconds_per_km <= 0
                  ? "text-[var(--color-cycling)]"
                  : "text-[var(--color-alert-amber)]"
              }`}
            >
              {match.pace_delta_seconds_per_km > 0 ? "+" : ""}
              {match.pace_delta_seconds_per_km}s /km
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)]">
              {match.pace_delta_seconds_per_km <= 0
                ? "Ahead of planned threshold pace"
                : "Slightly conservative vs planned pace"}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
          <span>
            Sesi latihan daya tahan ini tercatat sebagai sesi mandiri. Seluruh jarak dan beban berkontribusi penuh pada kalkulasi volume mingguan.
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono text-[10px] font-semibold">
            Valid Workout
          </span>
        </div>
      )}
    </section>
  );
}
