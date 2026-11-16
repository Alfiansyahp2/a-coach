"use client";

import React, { useState, useMemo } from "react";
import { ScheduledWorkout, Activity, AuthoritativeAthleteHealthContext } from "@/types";
import { CalendarWeek } from "../calendarBuilder";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { CalendarDayQuickAction } from "../cards/CalendarDayQuickAction";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Bike,
  Footprints,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Moon,
  Zap,
} from "lucide-react";

interface TrainingWeekAgendaViewProps {
  weeks: CalendarWeek[];
  todayStr: string;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
  healthContext?: AuthoritativeAthleteHealthContext | null;
}

export function TrainingWeekAgendaView({
  weeks,
  todayStr,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
  healthContext,
}: TrainingWeekAgendaViewProps) {
  const currentWeekIdx = useMemo(() => {
    const idx = weeks.findIndex((w) => w.isCurrentWeek);
    return idx !== -1 ? idx : 0;
  }, [weeks]);

  const [activeWeekIdx, setActiveWeekIdx] = useState(currentWeekIdx);
  const week = weeks[activeWeekIdx] || weeks[0];

  const canGoPrev = activeWeekIdx > 0;
  const canGoNext = activeWeekIdx < weeks.length - 1;

  const effectiveDist = week.completedDistanceMeters > 0 ? week.completedDistanceMeters : week.scheduledDistanceMeters;
  const effectiveKm = (effectiveDist / 1000).toFixed(1);

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Week Controller Strip */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canGoPrev && setActiveWeekIdx(activeWeekIdx - 1)}
            disabled={!canGoPrev}
            className={`p-1.5 rounded-lg border transition-all ${
              canGoPrev
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
                : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase text-[var(--color-text-primary)]">
                {week.weekLabel}
              </span>
              {week.isCurrentWeek && (
                <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--color-cycling)] text-white tracking-wider animate-pulse">
                  MINGGU AKTIF
                </span>
              )}
              {week.isDeload && (
                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                  DELOAD
                </span>
              )}
            </div>
            <span className="text-[10.5px] text-[var(--color-cycling)] block">
              {week.focusTitle}
            </span>
          </div>

          <button
            type="button"
            onClick={() => canGoNext && setActiveWeekIdx(activeWeekIdx + 1)}
            disabled={!canGoNext}
            className={`p-1.5 rounded-lg border transition-all ${
              canGoNext
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
                : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Stats Telemetry */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-tabular">
          <div className="bg-[var(--color-surface-muted)]/60 px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] mr-1.5">Target Jarak:</span>
            <strong className="text-[var(--color-text-primary)] font-bold">{effectiveKm} / {week.minTargetKm} km ({week.targetAchievedPct}%)</strong>
          </div>

          {week.estimatedWeeklyTss > 0 && (
            <div className="bg-[var(--color-surface-muted)]/60 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-cycling)]">
              <span className="text-[var(--color-text-muted)] mr-1.5">Beban:</span>
              <strong className="font-bold">~{week.estimatedWeeklyTss} TSS</strong>
            </div>
          )}

          <button
            type="button"
            onClick={() => setActiveWeekIdx(currentWeekIdx)}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Hari Ini</span>
          </button>
        </div>
      </div>

      {/* 2. 7 Spacious Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {week.days.map((day) => {
          const isFasting = day.status === "FASTING";
          const isBuffer = day.status === "BUFFER";
          const isPastDay = Boolean(todayStr && day.dateStr < todayStr && !day.isToday);

          return (
            <div
              key={day.dateStr}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all min-h-[300px] ${
                day.isToday
                  ? "bg-[var(--color-surface-card)] border-2 border-[var(--color-cycling)] ring-2 ring-[var(--color-cycling)]/25 shadow-md"
                  : day.status === "MISSED"
                  ? "bg-[var(--color-alert-red)]/[0.03] border border-[var(--color-alert-red)]/30"
                  : isFasting
                  ? "bg-purple-500/[0.02] border border-purple-500/25"
                  : "bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs"
              }`}
            >
              {/* Column Top Header */}
              <div className="pb-2 border-b border-[var(--color-border)] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[11px] text-[var(--color-text-secondary)] uppercase">
                    {day.dayName}
                  </span>
                  <div className="flex items-center gap-1">
                    {day.isToday && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-cycling)] text-white font-extrabold text-[8px] animate-pulse">
                        HARI INI
                      </span>
                    )}
                    <span className="font-bold text-[12px] text-[var(--color-text-primary)] font-tabular">
                      {day.dayNumber} {day.monthName}
                    </span>
                  </div>
                </div>

                {isFasting && (
                  <div className="flex items-center gap-1 text-[8.5px] text-purple-600 dark:text-purple-300 font-semibold">
                    <Moon className="w-2.5 h-2.5" />
                    <span>Puasa Sunnah • Istirahat</span>
                  </div>
                )}
                {isBuffer && (
                  <div className="flex items-center gap-1 text-[8.5px] text-[var(--color-text-secondary)]">
                    <Zap className="w-2.5 h-2.5 text-[var(--color-cycling)]" />
                    <span>Buffer Recovery Spin</span>
                  </div>
                )}
              </div>

              {/* Column Body: Prescribed vs Executed */}
              <div className="py-2.5 flex-1 space-y-2">
                {/* Planned Workouts */}
                {day.workouts.map((w) => {
                  const isRun = isRunningCategory(w.workout_category);
                  const isCycling = w.workout_category === "Cycling";
                  const isCompleted = w.status === "COMPLETED";
                  const isMissed = !isCompleted && (w.status === "MISSED" || isPastDay);

                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => onSelectWorkout(w)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1.5 block cursor-pointer ${
                        isCompleted
                          ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/50"
                          : isMissed
                          ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/40"
                          : isCycling
                          ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30"
                          : isRun
                          ? "bg-[var(--color-running)]/10 border-[var(--color-running)]/30"
                          : "bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded-full flex items-center gap-1 bg-[var(--color-surface-card)]">
                          {isCycling ? <Bike className="w-2.5 h-2.5" /> : isRun ? <Footprints className="w-2.5 h-2.5" /> : <ShieldAlert className="w-2.5 h-2.5" />}
                          <span>{isRun ? "LARI" : isCycling ? "EASY MTB" : "REHAB"}</span>
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                        ) : isMissed ? (
                          <XCircle className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
                        ) : null}
                      </div>

                      <div className="font-bold text-[12px] text-[var(--color-text-primary)] font-tabular leading-tight">
                        {w.target_distance_meters ? formatDistance(w.target_distance_meters) : w.target_duration_seconds ? formatDuration(w.target_duration_seconds) : "--"}
                      </div>

                      <div className="text-[8.5px] text-[var(--color-text-secondary)] leading-tight">
                        {w.target_intensity || "Zone 2 • RPE 3-4"}
                      </div>
                    </button>
                  );
                })}

                {/* Recorded Activities */}
                {day.activities.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => onSelectActivity?.(act)}
                    className="w-full text-left p-2 rounded-lg border bg-[var(--color-surface-card)] border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)] transition-all space-y-1 block cursor-pointer font-tabular"
                  >
                    <div className="flex items-center justify-between text-[8px] text-[var(--color-cycling)] font-bold">
                      <span>✓ TERCATAT</span>
                      <span>{formatDuration(act.moving_time_seconds)}</span>
                    </div>
                    <div className="font-bold text-[11px] text-[var(--color-text-primary)]">
                      {formatDistance(act.distance_meters)}
                    </div>
                    <div className="text-[8px] text-[var(--color-text-secondary)] truncate">
                      {act.name}
                    </div>
                  </button>
                ))}

                {!day.workouts.length && !day.activities.length && (
                  <div className="h-full flex items-center justify-center text-center text-[9px] text-[var(--color-text-muted)] py-8">
                    <span>{isFasting ? "Regenerasi Glikogen" : isBuffer ? "Cadangan Jarak" : "Jeda Pemulihan"}</span>
                  </div>
                )}
              </div>

              {/* Column Bottom Quick Action */}
              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[9px]">
                <span className="text-[var(--color-text-muted)]">
                  {day.activities.length ? "Selesai" : day.workouts.length ? "Terjadwal" : "Rest"}
                </span>
                <CalendarDayQuickAction
                  dateStr={day.dateStr}
                  defaultWorkout={day.workouts[0] || null}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

