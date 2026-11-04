"use client";

import React from "react";
import { ScheduledWorkout } from "@/types";
import { CheckCircle2, Heart, Zap } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/formatters";

export interface CalendarDayCardProps {
  day: {
    dateStr: string;
    dayNumber: number;
    monthName: string;
    dayOfWeek: number;
    dayName: string;
    isToday: boolean;
    workouts: ScheduledWorkout[];
  };
  minTargetKm: number;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  isRunningCategory: (category: string) => boolean;
}

export function CalendarDayCard({
  day,
  minTargetKm,
  onSelectWorkout,
  isRunningCategory,
}: CalendarDayCardProps) {
  const hasWorkouts = day.workouts.length > 0;
  const isFastingDay = day.dayOfWeek === 0 || day.dayOfWeek === 3; // Senin or Kamis
  const isSaturday = day.dayOfWeek === 5; // Sabtu

  return (
    <div
      className={`min-h-[160px] p-2.5 rounded-xl flex flex-col justify-between transition-all duration-200 ${
        day.isToday
          ? "bg-[var(--color-surface-card)] border-2 border-[var(--color-cycling)] shadow-md ring-1 ring-[var(--color-cycling)]/30"
          : isFastingDay
          ? "bg-purple-500/[0.04] border border-purple-500/20 shadow-xs"
          : isSaturday
          ? "bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)]"
          : hasWorkouts
          ? "bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] shadow-xs"
          : "bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] opacity-70"
      }`}
    >
      {/* Day Header (Date & Today Badge) */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-[10px] font-mono">
        <span className={`md:hidden font-bold ${isFastingDay ? "text-purple-600 dark:text-purple-300" : "text-[var(--color-text-secondary)]"}`}>
          {day.dayName}
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          {day.isToday && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-cycling)] text-white font-bold text-[8px] tracking-wider shadow-xs animate-pulse">
              HARI INI
            </span>
          )}
          <span className={`font-bold font-tabular ${day.isToday ? "text-[var(--color-cycling)] font-extrabold" : isFastingDay ? "text-purple-600 dark:text-purple-300" : "text-[var(--color-text-primary)]"}`}>
            {day.dayNumber} {day.monthName}
          </span>
        </div>
      </div>

      {/* Day Content: Workouts / Fasting / Saturday Buffer / Rest */}
      <div className="py-2 flex-1 space-y-1.5 font-mono">
        {hasWorkouts ? (
          day.workouts.map((w) => {
            const isRun = isRunningCategory(w.workout_category);
            const isCycling = w.workout_category === "Cycling";
            const isCompleted = w.status === "COMPLETED";

            return (
              <button
                key={w.id}
                onClick={() => onSelectWorkout(w)}
                className={`w-full text-left p-2 rounded-lg border transition-all space-y-1 block shadow-xs hover:-translate-y-0.5 ${
                  isCompleted
                    ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)]"
                    : isRun
                    ? "bg-[var(--color-running)]/10 border-[var(--color-running)]/30 hover:border-[var(--color-running)]"
                    : isCycling
                    ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30 hover:border-[var(--color-cycling)]"
                    : "bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)]/30 hover:border-[var(--color-alert-amber)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isRun
                        ? "bg-[var(--color-running)]/20 text-[var(--color-running)]"
                        : isCycling
                        ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)]"
                        : "bg-[var(--color-alert-amber)]/20 text-[var(--color-alert-amber)]"
                    }`}
                  >
                    {isRun ? "LARI BERTAHAP" : isCycling ? "EASY MTB" : "UPPER/REHAB"}
                  </span>

                  {isCompleted && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                  )}
                </div>

                {w.milestone_target_km && (
                  <div className="flex items-center gap-1 text-[8px] font-bold text-[var(--color-endurance)] bg-[var(--color-endurance)]/10 px-1.5 py-0.5 rounded border border-[var(--color-endurance)]/25">
                    <Zap className="w-2.5 h-2.5 text-[var(--color-endurance)] shrink-0" />
                    <span className="truncate">TONGGAK MINGGUAN {w.milestone_target_km ? `(${w.milestone_target_km} KM)` : ''}</span>
                  </div>
                )}

                <div className="font-bold text-[11px] text-[var(--color-text-primary)] leading-tight font-tabular">
                  {w.target_duration_seconds
                    ? formatDuration(w.target_duration_seconds)
                    : w.target_distance_meters
                    ? formatDistance(w.target_distance_meters)
                    : "--"}
                </div>

                <div className="text-[8px] text-[var(--color-text-secondary)] truncate">
                  {w.target_intensity || "Zone 2 • RPE 3–4"}
                </div>
              </button>
            );
          })
        ) : isFastingDay ? (
          /* Dedicated Fasting Card (Senin & Kamis) */
          <div className="h-full flex flex-col items-center justify-center py-2.5 text-center px-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 space-y-1">
            <span className="text-base leading-none">🌙</span>
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 tracking-wide">Puasa Sunnah</span>
            <span className="text-[8.5px] text-purple-600 dark:text-purple-400">Istirahat Penuh</span>
            <span className="text-[8px] text-[var(--color-text-muted)]">
              {day.dayOfWeek === 0 ? "Regenerasi Glikogen" : "Pemulihan Tubuh"}
            </span>
          </div>
        ) : isSaturday ? (
          /* Dedicated Saturday Buffer Card */
          <div className="h-full flex flex-col justify-between p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all text-left">
            <div>
              <div className="flex items-center justify-between text-[8px] pb-1 border-b border-[var(--color-border)]">
                <span className="font-bold text-[var(--color-text-secondary)]">SABTU BUFFER</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] font-semibold text-[7px] border border-[var(--color-border)]">
                  OPSIONAL
                </span>
              </div>
              <div className="my-1.5 space-y-0.5">
                <div className="text-[9.5px] font-bold text-[var(--color-text-primary)] leading-tight flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-[var(--color-cycling)]" />
                  Buffer Mingguan
                </div>
                <p className="text-[8px] text-[var(--color-text-secondary)] leading-tight">
                  Slot cadangan: Recovery spin ringan jika target ({minTargetKm} km) belum tercapai.
                </p>
              </div>
            </div>
            <div className="pt-1 border-t border-[var(--color-border)] flex items-center justify-between text-[7.5px] text-[var(--color-text-muted)]">
              <span>RPE 1–2</span>
              <span className="text-[var(--color-cycling)] font-medium">Persiapan Minggu</span>
            </div>
          </div>
        ) : (
          /* Other Rest Days */
          <div className="h-full flex flex-col items-center justify-center py-3 text-center text-[10px] text-[var(--color-text-muted)] rounded-lg">
            <Heart className={`w-4 h-4 mb-1 transition-colors ${day.isToday ? "text-[var(--color-alert-amber)] animate-pulse" : "text-[var(--color-text-muted)]"}`} />
            <span className={day.isToday ? "text-[var(--color-text-primary)] font-bold" : ""}>Jeda Pemulihan</span>
            <span className="text-[8px] text-[var(--color-text-muted)]">Proteksi Sendi</span>
          </div>
        )}
      </div>

      {/* Day Footer Subtext */}
      <div className="pt-1 border-t border-[var(--color-border)] text-[9px] font-mono text-[var(--color-text-muted)] text-right">
        {hasWorkouts ? (
          <span
            className="text-[var(--color-cycling)] hover:underline cursor-pointer font-semibold"
            onClick={() => onSelectWorkout(day.workouts[0])}
          >
            Detail Sesi ↗
          </span>
        ) : isFastingDay ? (
          <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center justify-end gap-1">
            <span>🌙</span> Puasa Sunnah
          </span>
        ) : isSaturday ? (
          <span className="text-[var(--color-text-secondary)] font-semibold">Slot Buffer</span>
        ) : (
          <span className={day.isToday ? "text-[var(--color-cycling)] font-semibold" : ""}>Istirahat</span>
        )}
      </div>
    </div>
  );
}
