import React from "react";
import { Sliders, Bike, Footprints, Zap, CheckCircle2 } from "lucide-react";

interface TrainingPhaseAndFilterToolbarProps {
  selectedPhase: "ALL" | "PHASE_1" | "PHASE_2" | "PHASE_3";
  onSelectPhase: (phase: "ALL" | "PHASE_1" | "PHASE_2" | "PHASE_3") => void;
  displayedWeeksCount: number;
  filter: "ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED";
  onSelectFilter: (filter: "ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED") => void;
  totalWorkoutsCount: number;
  cyclingCount: number;
  runningCount: number;
  rehabCount: number;
  completedCount: number;
  filteredCount: number;
}

export function TrainingPhaseAndFilterToolbar({
  selectedPhase,
  onSelectPhase,
  displayedWeeksCount,
  filter,
  onSelectFilter,
  totalWorkoutsCount,
  cyclingCount,
  runningCount,
  rehabCount,
  completedCount,
  filteredCount,
}: TrainingPhaseAndFilterToolbarProps) {
  return (
    <div className="space-y-3 font-mono text-xs">
      {/* 1. Phase Switcher (12-Week Periodization Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] px-2 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[var(--color-text-muted)]" />
            FASE:
          </span>
          <button
            onClick={() => onSelectPhase("ALL")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "ALL"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua Fase (M1–12)
          </button>
          <button
            onClick={() => onSelectPhase("PHASE_1")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "PHASE_1"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Fase 1: Aerobic Base (M1–4)
          </button>
          <button
            onClick={() => onSelectPhase("PHASE_2")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "PHASE_2"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Fase 2: Volume &amp; Deload (M5–8)
          </button>
          <button
            onClick={() => onSelectPhase("PHASE_3")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "PHASE_3"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Fase 3: Spesifisitas Zone 2 (M9–12)
          </button>
        </div>

        <div className="text-[10px] text-[var(--color-text-muted)] pr-2 font-tabular">
          <span>Menampilkan: <strong className="text-[var(--color-text-primary)]">{displayedWeeksCount} Minggu Siklus</strong></span>
        </div>
      </div>

      {/* 2. Sport Type Filter Segment Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onSelectFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              filter === "ALL"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua Sesi ({totalWorkoutsCount})
          </button>
          <button
            onClick={() => onSelectFilter("CYCLING")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "CYCLING"
                ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Sepeda MTB ({cyclingCount})</span>
          </button>
          <button
            onClick={() => onSelectFilter("RUNNING")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "RUNNING"
                ? "bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-running)]"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Lari Bertahap ({runningCount})</span>
          </button>
          <button
            onClick={() => onSelectFilter("REHAB")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "REHAB"
                ? "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-alert-amber)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Rehab &amp; Tubuh Atas ({rehabCount})</span>
          </button>
          <button
            onClick={() => onSelectFilter("COMPLETED")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "COMPLETED"
                ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terverifikasi Strava ({completedCount})</span>
          </button>
        </div>

        <div className="text-[10px] text-[var(--color-text-muted)] pr-2 font-tabular">
          <span>Menampilkan: <strong className="text-[var(--color-text-primary)]">{filteredCount} Sesi Terdaftar</strong></span>
        </div>
      </div>
    </div>
  );
}

