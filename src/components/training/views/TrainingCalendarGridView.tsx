import React, { useMemo } from "react";
import { formatDuration } from "@/lib/formatters";
import { CalendarDayCard } from "../CalendarDayCard";
import { CalendarWeek } from "../calendarBuilder";
import { ScheduledWorkout, Activity } from "@/types";

interface TrainingCalendarGridViewProps {
  displayedWeeks: CalendarWeek[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
  todayStr?: string;
}

const DAY_HEADERS = [
  { name: "SENIN", subtitle: "(PUASA)", color: "text-purple-600 dark:text-purple-400" },
  { name: "SELASA", subtitle: "(EASY MTB)", color: "text-[var(--color-cycling)]" },
  { name: "RABU", subtitle: "(OPSI/REHAB)", color: "text-[var(--color-alert-amber)]" },
  { name: "KAMIS", subtitle: "(PUASA)", color: "text-purple-600 dark:text-purple-400" },
  { name: "JUMAT", subtitle: "(RECOVERY)", color: "text-[var(--color-cycling)]" },
  { name: "SABTU", subtitle: "(BUFFER)", color: "text-[var(--color-text-secondary)]" },
  { name: "MINGGU", subtitle: "(LONG MTB)", color: "text-[var(--color-cycling)]" },
];

export function TrainingCalendarGridView({
  displayedWeeks,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
  todayStr,
}: TrainingCalendarGridViewProps) {
  const currentDayIndex = useMemo(() => {
    if (!todayStr) return -1;
    const parts = todayStr.split("-").map(Number);
    if (parts.length !== 3) return -1;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return (d.getDay() + 6) % 7; // Monday = 0, ..., Wednesday = 2, Sunday = 6
  }, [todayStr]);

  return (
    <div className="space-y-6 font-mono">
      {/* Day Names Header Row (Mon - Sun) */}
      <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--color-text-muted)] pb-1 border-b border-[var(--color-border)]">
        {DAY_HEADERS.map((col, idx) => {
          const isTodayColumn = currentDayIndex === idx;
          return (
            <div
              key={col.name}
              className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-t-lg transition-all ${
                isTodayColumn
                  ? `${col.color} bg-[var(--color-surface-card)] border-b-2 border-[var(--color-cycling)] font-extrabold shadow-xs`
                  : `${col.color}`
              }`}
            >
              {isTodayColumn && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)] animate-pulse" />
              )}
              <span>{col.name}</span>
              <span className="text-[8.5px] font-normal">{col.subtitle}</span>
            </div>
          );
        })}
      </div>

      {/* Weeks Loop */}
      {displayedWeeks.map((week) => {
        const effectiveDist = week.completedDistanceMeters > 0 ? week.completedDistanceMeters : week.scheduledDistanceMeters;
        const effectiveKm = (effectiveDist / 1000).toFixed(1);

        return (
          <div
            key={week.weekNumber}
            className={`p-4 rounded-xl bg-[var(--color-surface-card)] border space-y-3 shadow-xs transition-all ${
              week.isDeload
                ? "border-purple-500/40 bg-purple-500/[0.03]"
                : week.isCurrentWeek
                ? "border-[var(--color-cycling)]/40 ring-1 ring-[var(--color-cycling)]/20"
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
                  {week.isCurrentWeek && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-semibold tracking-wider">
                      MINGGU AKTIF
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--color-cycling)] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 font-semibold">
                    {week.focusTitle}
                  </span>
                  {week.isDeload && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                      DELOAD WEEK
                    </span>
                  )}
                  {effectiveDist >= week.minDistanceMeters ? (
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
                    Total Terjadwal: <strong className="text-[var(--color-text-primary)] font-bold">{(week.scheduledDistanceMeters / 1000).toFixed(1)} km</strong>
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
                    <span className="font-bold text-[var(--color-text-primary)]">{effectiveKm} / {week.minTargetKm} km</span>
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
                  todayStr={todayStr}
                  onSelectWorkout={onSelectWorkout}
                  onSelectActivity={onSelectActivity}
                  isRunningCategory={isRunningCategory}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
