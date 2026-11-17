"use client";

import React from "react";
import { MonthGridWeek } from "./monthCalendarBuilder";
import { formatDuration } from "@/lib/formatters";
import { Zap, CheckCircle2 } from "lucide-react";

interface MonthWeekSummaryColumnProps {
  week: MonthGridWeek;
}

export function MonthWeekSummaryColumn({ week }: MonthWeekSummaryColumnProps) {
  const effectiveDist = week.completedDistMeters > 0 ? week.completedDistMeters : week.scheduledDistMeters;
  const effectiveKm = (effectiveDist / 1000).toFixed(1);

  return (
    <div
      className={`p-2.5 flex flex-col justify-between border-b border-[var(--color-border)]/60 font-mono text-xs transition-colors min-h-[120px] ${
        week.isCurrentWeek
          ? "bg-[var(--color-cycling)]/[0.04] border-l-2 border-l-[var(--color-cycling)]"
          : week.isDeload
          ? "bg-purple-500/[0.03] border-l-2 border-l-purple-500/50"
          : "bg-[var(--color-surface-muted)]/30 border-l border-[var(--color-border)]/50"
      }`}
    >
      {/* Header: Week Label & Status */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-[10.5px] uppercase text-[var(--color-text-primary)]">
            {week.weekLabel.split("(")[0].trim()}
          </span>
          {week.isCurrentWeek && (
            <span className="text-[7.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[var(--color-cycling)] text-white tracking-wider animate-pulse">
              AKTIF
            </span>
          )}
          {week.isDeload && (
            <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">
              DELOAD
            </span>
          )}
        </div>

        <div className="text-[8.5px] text-[var(--color-text-secondary)] truncate" title={week.focusTitle}>
          {week.focusTitle.split(":")[1]?.trim() || week.focusTitle}
        </div>
      </div>

      {/* Center: Distance Progress Bar */}
      <div className="space-y-1 py-1 font-tabular">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[var(--color-text-muted)]">Jarak:</span>
          <span className="font-bold text-[var(--color-text-primary)]">
            {effectiveKm} / {week.minTargetKm} km
          </span>
        </div>

        <div className="w-full h-1.5 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]/50">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              week.isDeload
                ? "bg-purple-500"
                : week.targetAchievedPct >= 100
                ? "bg-[var(--color-cycling)]"
                : "bg-[var(--color-endurance)]"
            }`}
            style={{ width: `${Math.min(100, week.targetAchievedPct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[8px] text-[var(--color-text-muted)]">
          <span>{week.targetAchievedPct}% Target</span>
          <span>{formatDuration(week.totalDurationSeconds)}</span>
        </div>
      </div>

      {/* Footer: Sesi & TSS Telemetry */}
      <div className="flex items-center justify-between text-[8px] text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]/40 font-tabular">
        <span className="flex items-center gap-0.5 text-[var(--color-cycling)] font-semibold">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>{week.completedCount} Sesi Selesai</span>
        </span>
        {week.estimatedTss > 0 && (
          <span className="flex items-center gap-0.5 text-[var(--color-endurance)]">
            <Zap className="w-2.5 h-2.5" />
            <span>~{week.estimatedTss} TSS</span>
          </span>
        )}
      </div>
    </div>
  );
}

