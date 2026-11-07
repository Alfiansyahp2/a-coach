import React from "react";
import { Bike, Footprints, Calendar, Trophy } from "lucide-react";

export type GoalSportFilter = "ALL" | "RIDE" | "RUN" | "FREQUENCY" | "ACHIEVED";

interface GoalsFilterTabsProps {
  filterSport: GoalSportFilter;
  onSelectFilter: (filter: GoalSportFilter) => void;
  totalGoalsCount: number;
  filteredCount: number;
}

export function GoalsFilterTabs({
  filterSport,
  onSelectFilter,
  totalGoalsCount,
  filteredCount,
}: GoalsFilterTabsProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
        <button
          onClick={() => onSelectFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterSport === "ALL"
              ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          Semua ({totalGoalsCount})
        </button>
        <button
          onClick={() => onSelectFilter("RIDE")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterSport === "RIDE"
              ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Sepeda</span>
        </button>
        <button
          onClick={() => onSelectFilter("RUN")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterSport === "RUN"
              ? "bg-[var(--color-surface-card)] text-[var(--color-running)] border border-[var(--color-border)] shadow-xs font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Lari</span>
        </button>
        <button
          onClick={() => onSelectFilter("FREQUENCY")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterSport === "FREQUENCY"
              ? "bg-[var(--color-surface-card)] text-[var(--color-endurance)] border border-[var(--color-border)] shadow-xs font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Konsistensi</span>
        </button>
        <button
          onClick={() => onSelectFilter("ACHIEVED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filterSport === "ACHIEVED"
              ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Tercapai</span>
        </button>
      </div>

      <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
        Menampilkan {filteredCount} dari {totalGoalsCount} sasaran
      </span>
    </div>
  );
}

