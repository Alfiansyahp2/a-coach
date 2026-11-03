"use client";

import React from "react";
import { Bike, Footprints, Gauge } from "lucide-react";

export function MacroObjectivesStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
      {/* Road to 100km Century Ride */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] space-y-2.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Bike className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Road to 100 km Century</span>
          </span>
          <span className="text-[var(--color-cycling)] font-extrabold font-tabular text-xs">56.1%</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div className="h-full rounded-full bg-[var(--color-cycling)]" style={{ width: "56.1%" }} />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>Rekor Bebas Nyeri: <strong className="text-[var(--color-text-primary)] font-tabular">56.10 km</strong></span>
          <span>Target: <strong className="text-[var(--color-text-primary)] font-tabular">100 km MTB</strong></span>
        </div>
      </div>

      {/* Marathon Pathway */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-running)] space-y-2.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Footprints className="w-4 h-4 text-[var(--color-running)]" />
            <span>Jalur Maraton 10–20K</span>
          </span>
          <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold font-tabular">
            29.2%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div className="h-full rounded-full bg-[var(--color-running)]" style={{ width: "29.2%" }} />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>Lari Dasar: <strong className="text-[var(--color-text-primary)] font-tabular">12.33 km</strong></span>
          <span>Tahap: <strong className="text-[var(--color-text-primary)]">Return-to-Run</strong></span>
        </div>
      </div>

      {/* Weekly Minimum Mileage Target Progress */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] space-y-2.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Intensitas Zone 2 (RPE 3–4)</span>
          </span>
          <span className="text-[var(--color-cycling)] font-bold text-xs">Talk Test</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div className="h-full rounded-full bg-[var(--color-cycling)]" style={{ width: "100%" }} />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>Kayuhan: <strong className="text-[var(--color-text-primary)]">Ringan &amp; Stabil</strong></span>
          <span>Sensor: <strong className="text-[var(--color-text-muted)]">Tanpa HRM</strong></span>
        </div>
      </div>

      {/* Fasting Routine Compliance */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-purple-500/40 space-y-2.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <span className="text-sm">🌙</span>
            <span>Jadwal Puasa Sunnah</span>
          </span>
          <span className="text-purple-600 dark:text-purple-300 font-bold text-xs">100% Selaras</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div className="h-full rounded-full bg-purple-500" style={{ width: "100%" }} />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>Puasa: <strong className="text-purple-600 dark:text-purple-300">Senin &amp; Kamis</strong></span>
          <span>Latihan: <strong className="text-[var(--color-cycling)]">Sel, Rab, Jum, Min</strong></span>
        </div>
      </div>
    </div>
  );
}
