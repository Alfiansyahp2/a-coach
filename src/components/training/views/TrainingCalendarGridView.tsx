import React from "react";
import { formatDuration } from "@/lib/formatters";
import { CalendarDayCard } from "../CalendarDayCard";
import { ScheduledWorkout } from "@/types";

interface TrainingCalendarGridViewProps {
  displayedWeeks: any[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  isRunningCategory: (category: string) => boolean;
}

export function TrainingCalendarGridView({
  displayedWeeks,
  onSelectWorkout,
  isRunningCategory,
}: TrainingCalendarGridViewProps) {
  return (
    <div className="space-y-6 font-mono">
      {/* Day Names Header Row (Mon - Sun) */}
      <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--color-text-muted)] pb-1 border-b border-[var(--color-border)]">
        <div className="text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
          <span>SENIN</span>
          <span className="text-[8.5px] font-normal">(PUASA)</span>
        </div>
        <div className="text-[var(--color-cycling)] flex items-center justify-center gap-1">
          <span>SELASA</span>
          <span className="text-[8.5px] font-normal">(EASY MTB)</span>
        </div>
        <div className="text-[var(--color-alert-amber)] flex items-center justify-center gap-1">
          <span>RABU</span>
          <span className="text-[8.5px] font-normal">(OPSI/REHAB)</span>
        </div>
        <div className="text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
          <span>KAMIS</span>
          <span className="text-[8.5px] font-normal">(PUASA)</span>
        </div>
        <div className="text-[var(--color-cycling)] flex items-center justify-center gap-1">
          <span>JUMAT</span>
          <span className="text-[8.5px] font-normal">(RECOVERY)</span>
        </div>
        <div className="text-[var(--color-text-secondary)] flex items-center justify-center gap-1">
          <span>SABTU</span>
          <span className="text-[8.5px] font-normal">(BUFFER)</span>
        </div>
        <div className="text-[var(--color-cycling)] flex items-center justify-center gap-1">
          <span>MINGGU</span>
          <span className="text-[8.5px] font-normal">(LONG MTB)</span>
        </div>
      </div>

      {/* Weeks Loop */}
      {displayedWeeks.map((week) => (
        <div
          key={week.weekNumber}
          className={`p-4 rounded-xl bg-[var(--color-surface-card)] border space-y-3 shadow-xs transition-all ${
            week.isDeload
              ? "border-purple-500/40 bg-purple-500/[0.03]"
              : "border-[var(--color-border)]"
          }`}
        >
          {/* Week Row Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    week.isDeload ? "bg-purple-500" : "bg-[var(--color-cycling)]"
                  }`}
                />
                <span className="text-xs font-bold uppercase text-[var(--color-text-primary)]">
                  {week.weekLabel}
                </span>
                <span className="text-[10px] text-[var(--color-cycling)] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 font-semibold">
                  {week.focusTitle}
                </span>
                {week.isDeload && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                    DELOAD WEEK
                  </span>
                )}
                {week.totalDistanceMeters >= week.minDistanceMeters ? (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30">
                    ✓ TARGET TERCAPAI ({week.targetAchievedPct}%)
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30">
                    PROGRES ({week.targetAchievedPct}%)
                  </span>
                )}
              </div>

              {/* Weekly Mileage Target vs Scheduled Breakdown */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-[var(--color-text-secondary)] font-tabular">
                <span>
                  Target Minimal: <strong className="text-[var(--color-text-primary)] font-bold">{week.minTargetKm} km</strong>
                </span>
                <span>•</span>
                <span>
                  Total Terjadwal: <strong className="text-[var(--color-text-primary)] font-bold">{(week.totalDistanceMeters / 1000).toFixed(1)} km</strong>
                </span>
                <span>•</span>
                <span className="text-[var(--color-text-muted)]">
                  (Sepeda MTB: <strong className="text-[var(--color-cycling)]">{(week.cyclingDistanceMeters / 1000).toFixed(1)} km</strong>
                  {week.runningDistanceMeters > 0 && (
                    <> • Lari: <strong className="text-[var(--color-running)]">{(week.runningDistanceMeters / 1000).toFixed(1)} km</strong></>
                  )})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              {/* Mini Progress Bar for Weekly Target Mileage */}
              <div className="space-y-1 text-right">
                <div className="flex items-center justify-between gap-3 text-[9.5px] text-[var(--color-text-muted)] font-tabular">
                  <span>Progres Jarak:</span>
                  <span className="font-bold text-[var(--color-text-primary)]">{(week.totalDistanceMeters / 1000).toFixed(1)} / {week.minTargetKm} km</span>
                </div>
                <div className="w-32 h-2 bg-[var(--color-surface-muted)] rounded-full border border-[var(--color-border)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
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

              <div className="text-[11px] text-[var(--color-text-muted)] pl-2 border-l border-[var(--color-border)] font-tabular">
                <span>Durasi: <strong className="text-[var(--color-text-primary)]">{formatDuration(week.totalDurationSeconds)}</strong></span>
              </div>
            </div>
          </div>

          {/* 7 Days Grid for this week */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
            {week.days.map((day: any) => (
              <CalendarDayCard
                key={day.dateStr}
                day={day}
                minTargetKm={week.minTargetKm}
                onSelectWorkout={onSelectWorkout}
                isRunningCategory={isRunningCategory}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

