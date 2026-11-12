"use client";

import React from "react";
import { formatDuration } from "@/lib/formatters";
import { CalendarWeek } from "../calendarBuilder";
import { ChevronDown, ChevronUp, Zap, CheckCircle2 } from "lucide-react";

interface CalendarWeekRowHeaderProps {
  week: CalendarWeek;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function CalendarWeekRowHeader({
  week,
  isCollapsed,
  onToggleCollapse,
}: CalendarWeekRowHeaderProps) {
  const effectiveDist = week.completedDistanceMeters > 0 ? week.completedDistanceMeters : week.scheduledDistanceMeters;
  const effectiveKm = (effectiveDist / 1000).toFixed(1);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)] font-mono">
      <div className="space-y-1.5 flex-1">
        {/* Row 1: Week Label, Badges & Focus */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-1.5 text-xs font-bold uppercase text-[var(--color-text-primary)] hover:text-[var(--color-cycling)] transition-colors cursor-pointer"
            title={isCollapsed ? "Buka rincian hari" : "Lipat rincian hari"}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${week.isDeload ? "bg-purple-500" : "bg-[var(--color-cycling)]"}`} />
            <span>{week.weekLabel}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {week.isCurrentWeek && (
            <span className="text-[8.5px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--color-cycling)] text-white tracking-wider shadow-xs animate-pulse">
              MINGGU AKTIF
            </span>
          )}

          <span className="text-[9.5px] text-[var(--color-cycling)] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 font-semibold truncate max-w-[280px]">
            {week.focusTitle}
          </span>

          {week.isDeload && (
            <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
              DELOAD WEEK
            </span>
          )}

          {effectiveDist >= week.minDistanceMeters ? (
            <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>TARGET ({week.targetAchievedPct}%)</span>
            </span>
          ) : (
            <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30">
              PROGRES ({week.targetAchievedPct}%)
            </span>
          )}
        </div>

        {/* Row 2: Target Mileage vs Scheduled Breakdown */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10.5px] text-[var(--color-text-secondary)] font-tabular">
          <span>
            Target Minimal: <strong className="text-[var(--color-text-primary)] font-bold">{week.minTargetKm} km</strong>
          </span>
          <span>•</span>
          <span>
            Terjadwal: <strong className="text-[var(--color-text-primary)] font-bold">{(week.scheduledDistanceMeters / 1000).toFixed(1)} km</strong>
          </span>
          <span>•</span>
          <span className="text-[var(--color-text-muted)]">
            (MTB: <strong className="text-[var(--color-cycling)]">{(week.cyclingDistanceMeters / 1000).toFixed(1)} km</strong>
            {week.runningDistanceMeters > 0 && (
              <> • Lari: <strong className="text-[var(--color-running)]">{(week.runningDistanceMeters / 1000).toFixed(1)} km</strong></>
            )})
          </span>
          {week.estimatedWeeklyTss > 0 && (
            <>
              <span>•</span>
              <span className="text-[var(--color-cycling)] font-semibold flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                <span>Beban: ~{week.estimatedWeeklyTss} TSS</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Telemetries: Sparkline & Progress Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs shrink-0">
        {/* 7-Day Mini Spark-Strip */}
        <div className="flex items-center gap-1 bg-[var(--color-surface-muted)]/70 px-2 py-1 rounded-lg border border-[var(--color-border)]">
          <span className="text-[8px] text-[var(--color-text-muted)] mr-1 uppercase font-bold">Hari:</span>
          {week.sparklineDays.map((spark) => {
            const isCompleted = spark.status === "COMPLETED";
            const isToday = spark.status === "TODAY";
            const isMissed = spark.status === "MISSED";
            const isFasting = spark.status === "FASTING";
            const isPlanned = spark.status === "PLANNED";

            return (
              <span
                key={spark.dateStr}
                title={`${spark.label}: ${spark.status}`}
                className={`w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                  isToday
                    ? "bg-[var(--color-cycling)] text-white shadow-xs ring-1 ring-[var(--color-cycling)] animate-pulse"
                    : isCompleted
                    ? "bg-[var(--color-cycling)]/25 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40"
                    : isMissed
                    ? "bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30"
                    : isPlanned
                    ? "bg-[var(--color-alert-amber)]/20 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30"
                    : isFasting
                    ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                    : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                }`}
              >
                {spark.label}
              </span>
            );
          })}
        </div>

        {/* Progress Bar for Weekly Target Mileage */}
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-between gap-3 text-[9px] text-[var(--color-text-muted)] font-tabular">
            <span>Selesai:</span>
            <span className="font-bold text-[var(--color-text-primary)]">{effectiveKm} / {week.minTargetKm} km</span>
          </div>
          <div className="w-28 h-2 bg-[var(--color-surface-muted)] rounded-full border border-[var(--color-border)] overflow-hidden">
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
        </div>

        <div className="text-[10px] text-[var(--color-text-muted)] pl-2 border-l border-[var(--color-border)] font-tabular">
          <span>Durasi: <strong className="text-[var(--color-text-primary)]">{formatDuration(week.totalDurationSeconds)}</strong></span>
        </div>
      </div>
    </div>
  );
}

