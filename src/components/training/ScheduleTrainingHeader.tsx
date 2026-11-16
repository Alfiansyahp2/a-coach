"use client";

import React from "react";
import Link from "next/link";
import { TrainingPlan } from "@/types";
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Grid,
  List,
  ClipboardCheck,
} from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";

interface ScheduleTrainingHeaderProps {
  initialPlan: TrainingPlan | null;
  viewMode: "calendar" | "list";
  setViewMode: (mode: "calendar" | "list") => void;
  handleRegenerate: () => void;
  isRegenerating: boolean;
}

export function ScheduleTrainingHeader({
  initialPlan,
  viewMode,
  setViewMode,
  handleRegenerate,
  isRegenerating,
}: ScheduleTrainingHeaderProps) {
  return (
    <div className="p-5 sm:p-6 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono shadow-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-primary)]">
                {initialPlan?.title || "Program Periodisasi 12-Minggu Zone 2 Endurance"}
              </h1>
              <span className="text-[9.5px] px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold uppercase tracking-wider">
                Active Macrocycle
              </span>
            </div>
            <span className="text-[11px] text-[var(--color-text-secondary)] block">
              Roadmap 3 Bulan • MTB Zone 2 (RPE 3–4) • 3 Sesi/Minggu • Puasa Senin &amp; Kamis Terproteksi
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View Mode Toggle: Calendar Grid vs List */}
        <div className="flex items-center p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === "calendar"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Kalender Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === "list"
                ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <List className="w-3.5 h-3.5 text-[var(--color-running)]" />
            <span>Daftar Sesi</span>
          </button>
        </div>

        <AddActivityModal variant="button" />

        <Link
          href="/recap"
          className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          title="Buka Rekap Telemetri Mingguan"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span className="hidden sm:inline">Rekap Mingguan</span>
        </Link>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-4 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[var(--color-cycling)] ${isRegenerating ? "animate-spin" : ""}`} />
          <span>{isRegenerating ? "Mengalibrasi..." : "Sinkronisasi"}</span>
        </button>
      </div>
    </div>
  );
}

