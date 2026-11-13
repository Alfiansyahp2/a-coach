"use client";

import React from "react";
import Link from "next/link";
import { TrainingPlan, AuthoritativeAthleteHealthContext } from "@/types";
import {
  Calendar as CalendarIcon,
  Grid,
  Columns,
  List,
  ClipboardCheck,
  Bike,
  Footprints,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";

export type CalendarViewModel =
  | "month_grid"
  | "week_agenda"
  | "kinetic_bubbles"
  | "field_journal"
  | "periodization"
  | "micro_hud"
  | "list";

interface CalendarCommandBarProps {
  initialPlan: TrainingPlan | null;
  viewMode: CalendarViewModel;
  setViewMode: (mode: CalendarViewModel) => void;
  filter: "ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED";
  onSelectFilter: (filter: "ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED") => void;
  healthContext: AuthoritativeAthleteHealthContext | null;
  isGuidelinesOpen: boolean;
  onToggleGuidelines: () => void;
  cyclingCount: number;
  runningCount: number;
}

export function CalendarCommandBar({
  initialPlan,
  viewMode,
  setViewMode,
  filter,
  onSelectFilter,
  healthContext,
  isGuidelinesOpen,
  onToggleGuidelines,
  cyclingCount,
  runningCount,
}: CalendarCommandBarProps) {
  const readiness = healthContext?.latestReadiness;
  const isRunningOnHold = readiness && (readiness.running_readiness === "ON_HOLD" || readiness.running_readiness === "REQUIRES_CLINICAL_REVIEW");

  const handleSelectViewMode = (mode: CalendarViewModel) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("athlete_calendar_view_preference", mode);
    }
  };

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs font-mono text-xs space-y-3">
      {/* Row 1: Brand & View Switcher & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[var(--color-border)]">
        {/* Left: Program Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs uppercase font-bold tracking-wider text-[var(--color-text-primary)]">
                {initialPlan?.title || "Program Periodisasi 12-Minggu Zone 2"}
              </h1>
              <span className="text-[8px] px-2 py-0.2 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold uppercase">
                Active Macrocycle
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              MTB Zone 2 (RPE 3–4) • Puasa Senin &amp; Kamis Terproteksi
            </span>
          </div>
        </div>

        {/* Center: Multi-Model View Switcher Dropdown */}
        <div className="flex items-center gap-1.5 self-start lg:self-center">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>MODEL UI:</span>
          </span>
          <select
            value={viewMode}
            onChange={(e) => handleSelectViewMode(e.target.value as CalendarViewModel)}
            className="bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[var(--color-cycling)] cursor-pointer shadow-xs"
          >
            <option value="month_grid">⊞ 1. Grid Bulan (WKO / TrainingPeaks)</option>
            <option value="week_agenda">▥ 2. Agenda Minggu (Garmin Cockpit)</option>
            <option value="kinetic_bubbles">◉ 3. Gelembung Kinetik (Strava Flow)</option>
            <option value="field_journal">📖 4. Buku Jurnal Lapangan (Field Journal)</option>
            <option value="periodization">☷ 5. Garis Waktu Makro (Gantt &amp; PMC)</option>
            <option value="micro_hud">⌨️ 6. Micro-HUD (Keyboard Minimalist)</option>
            <option value="list">☰ 7. Daftar Kronologis Sesi</option>
          </select>
        </div>

        {/* Right: Quick Action Modals */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <AddActivityModal variant="button" />
          <Link
            href="/recap"
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Buka Rekap Telemetri Mingguan"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span className="hidden sm:inline">Rekap</span>
          </Link>
        </div>
      </div>

      {/* Row 2: Secondary Controls (Filters, Clinical Status & Drawer Toggle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Sport Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectFilter("ALL")}
            className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold cursor-pointer ${
              filter === "ALL"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua
          </button>

          <button
            type="button"
            onClick={() => onSelectFilter("CYCLING")}
            className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              filter === "CYCLING"
                ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <Bike className="w-3 h-3" />
            <span>MTB ({cyclingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectFilter("RUNNING")}
            className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
              filter === "RUNNING"
                ? "bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-running)]"
            }`}
          >
            <Footprints className="w-3 h-3" />
            <span>Lari ({runningCount})</span>
          </button>
        </div>

        {/* Clinical Clearance Pill & Guidelines Toggle */}
        <div className="flex items-center gap-2">
          {readiness && (
            <div className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-bold border ${
              isRunningOnHold
                ? "bg-[var(--color-alert-amber)]/10 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
                : "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
            }`}>
              {isRunningOnHold ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
              <span>{isRunningOnHold ? "Lari: HOLD (ATFL)" : "Clear: MTB Zone 2"}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleGuidelines}
            className="px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)] font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Target Makro</span>
            {isGuidelinesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
