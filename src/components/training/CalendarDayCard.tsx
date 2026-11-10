"use client";

import React from "react";
import { Activity, ScheduledWorkout } from "@/types";
import { CheckCircle2, Heart, Zap, XCircle } from "lucide-react";
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
    activities?: Activity[];
  };
  minTargetKm: number;
  todayStr?: string;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

export function CalendarDayCard({
  day,
  minTargetKm,
  todayStr,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: CalendarDayCardProps) {
  const workouts = day.workouts || [];
  const activities = day.activities || [];
  const hasWorkouts = workouts.length > 0;
  const hasActivities = activities.length > 0;
  const isFastingDay = day.dayOfWeek === 0 || day.dayOfWeek === 3;
  const isSaturday = day.dayOfWeek === 5;

  const isPastDay = Boolean(todayStr && day.dateStr < todayStr && !day.isToday);
  const hasMissedWorkouts = workouts.some(
    (w) => w.status !== "COMPLETED" && (w.status === "MISSED" || isPastDay)
  );

  return (
    <div
      className={`min-h-[160px] p-2.5 rounded-lg flex flex-col justify-between transition-all duration-150 ${
        day.isToday
          ? "bg-[var(--color-surface-card)] border-2 border-[var(--color-cycling)] shadow-xs ring-1 ring-[var(--color-cycling)]/30"
          : hasMissedWorkouts && !hasActivities
          ? "bg-[var(--color-alert-red)]/[0.04] border border-[var(--color-alert-red)]/30 hover:border-[var(--color-alert-red)]/50 shadow-xs"
          : isFastingDay && !hasActivities && !hasWorkouts
          ? "bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] shadow-xs"
          : isSaturday && !hasActivities && !hasWorkouts
          ? "bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)]"
          : hasWorkouts || hasActivities
          ? "bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] shadow-xs"
          : "bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] opacity-70"
      }`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)] text-[10px] font-mono">
        <span
          className={`md:hidden font-bold ${
            hasMissedWorkouts && !hasActivities
              ? "text-[var(--color-alert-red)]"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          {day.dayName}
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          {day.isToday && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-cycling)] text-white font-bold text-[8px] tracking-wider shadow-xs animate-pulse">
              HARI INI
            </span>
          )}
          <span
            className={`font-bold font-tabular ${
              day.isToday
                ? "text-[var(--color-cycling)] font-extrabold"
                : hasMissedWorkouts && !hasActivities
                ? "text-[var(--color-alert-red)]"
                : "text-[var(--color-text-primary)]"
            }`}
          >
            {day.dayNumber} {day.monthName}
          </span>
        </div>
      </div>

      {/* Day Content */}
      <div className="py-2 flex-1 space-y-1.5 font-mono">
        {hasWorkouts &&
          workouts.map((w) => {
            const isRun = isRunningCategory(w.workout_category);
            const isCycling = w.workout_category === "Cycling";
            const isCompleted = w.status === "COMPLETED";
            const isMissed = !isCompleted && (w.status === "MISSED" || isPastDay);

            return (
              <button
                key={w.id}
                onClick={() => onSelectWorkout(w)}
                className={`w-full text-left p-2 rounded-md border transition-all space-y-1 block shadow-xs hover:-translate-y-0.5 cursor-pointer ${
                  isCompleted
                    ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)]"
                    : isMissed
                    ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/30 hover:border-[var(--color-alert-red)]/60"
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
                      isMissed
                        ? "bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)]"
                        : isRun
                        ? "bg-[var(--color-running)]/20 text-[var(--color-running)]"
                        : isCycling
                        ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)]"
                        : "bg-[var(--color-alert-amber)]/20 text-[var(--color-alert-amber)]"
                    }`}
                  >
                    {isRun ? "LARI BERTAHAP" : isCycling ? "EASY MTB" : "UPPER/REHAB"}
                  </span>

                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />}
                  {isMissed && (
                    <div className="flex items-center gap-1">
                      <span className="text-[7.5px] font-bold text-[var(--color-alert-red)] bg-[var(--color-alert-red)]/15 px-1 py-0.2 rounded border border-[var(--color-alert-red)]/30">
                        TERLEWAT
                      </span>
                      <XCircle className="w-3.5 h-3.5 text-[var(--color-alert-red)] shrink-0" />
                    </div>
                  )}
                </div>

                {w.milestone_target_km && (
                  <div className="flex items-center gap-1 text-[8px] font-bold text-[var(--color-endurance)] bg-[var(--color-endurance)]/10 px-1.5 py-0.5 rounded border border-[var(--color-endurance)]/25">
                    <Zap className="w-2.5 h-2.5 text-[var(--color-endurance)] shrink-0" />
                    <span className="truncate">TONGGAK MINGGUAN ({w.milestone_target_km} KM)</span>
                  </div>
                )}

                <div className={`font-bold text-[11px] leading-tight font-tabular ${isMissed ? "text-[var(--color-alert-red)]/90 line-through opacity-85" : "text-[var(--color-text-primary)]"}`}>
                  {w.target_duration_seconds ? formatDuration(w.target_duration_seconds) : w.target_distance_meters ? formatDistance(w.target_distance_meters) : "--"}
                </div>

                <div className={`text-[8px] truncate ${isMissed ? "text-[var(--color-alert-red)]/80 font-medium" : "text-[var(--color-text-secondary)]"}`}>
                  {isMissed ? "Tidak terlaksana (Sesi Terlewat)" : (w.target_intensity || "Zone 2 • RPE 3–4")}
                </div>
              </button>
            );
          })}

        {/* 2. Recorded Activities */}
        {hasActivities &&
          activities.map((act) => {
            const isRun = (act.sport_type || "").toLowerCase().includes("run");
            const isCycling = (act.sport_type || "").toLowerCase().includes("ride") || (act.sport_type || "").toLowerCase().includes("cycl");

            return (
              <button
                key={act.id}
                type="button"
                onClick={() => onSelectActivity?.(act)}
                className="w-full text-left p-2 rounded-md border bg-[var(--color-surface-card)] border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)] hover:-translate-y-0.5 transition-all space-y-1 block shadow-xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isRun ? "bg-[var(--color-running)]/20 text-[var(--color-running)]" : isCycling ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)]" : "bg-[var(--color-alert-amber)]/20 text-[var(--color-alert-amber)]"
                  }`}>
                    {isRun ? "LARI" : isCycling ? "RIDE" : act.sport_type}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[7.5px] font-bold text-[var(--color-cycling)] bg-[var(--color-cycling)]/15 px-1 py-0.2 rounded border border-[var(--color-cycling)]/30">
                      TERCATAT
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />
                  </div>
                </div>

                <div className="font-bold text-[11px] text-[var(--color-text-primary)] leading-tight font-tabular">
                  {formatDistance(act.distance_meters)} • {formatDuration(act.moving_time_seconds)}
                </div>
                <div className="text-[8px] text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-text-primary)]" title={act.name}>
                  {act.name}
                </div>
              </button>
            );
          })}

        {/* 3. Rest Day / Fasting Day Fallback */}
        {!hasWorkouts && !hasActivities && (
          isFastingDay ? (
            <div className="h-full flex flex-col items-center justify-center py-2.5 text-center px-1.5 rounded-md bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)] space-y-1">
              <span className="text-base leading-none">🌙</span>
              <span className="text-[10px] font-bold text-[var(--color-text-primary)] tracking-wide">Puasa Sunnah</span>
              <span className="text-[8.5px] text-[var(--color-text-secondary)]">Istirahat Penuh</span>
              <span className="text-[8px] text-[var(--color-text-muted)]">
                {day.dayOfWeek === 0 ? "Regenerasi Glikogen" : "Pemulihan Tubuh"}
              </span>
            </div>
          ) : isSaturday ? (
            <div className="h-full flex flex-col justify-between p-2 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all text-left">
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
                    <span>Buffer Mingguan</span>
                  </div>
                  <p className="text-[8px] text-[var(--color-text-secondary)] leading-tight">
                    Slot cadangan: Recovery spin jika target ({minTargetKm} km) belum tercapai.
                  </p>
                </div>
              </div>
              <div className="pt-1 border-t border-[var(--color-border)] flex items-center justify-between text-[7.5px] text-[var(--color-text-muted)]">
                <span>RPE 1–2</span>
                <span className="text-[var(--color-cycling)] font-medium">Persiapan Minggu</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-3 text-center text-[10px] text-[var(--color-text-muted)] rounded-md">
              <Heart className={`w-4 h-4 mb-1 transition-colors ${day.isToday ? "text-[var(--color-alert-amber)] animate-pulse" : "text-[var(--color-text-muted)]"}`} />
              <span className={day.isToday ? "text-[var(--color-text-primary)] font-bold" : ""}>Jeda Pemulihan</span>
              <span className="text-[8px] text-[var(--color-text-muted)]">Proteksi Sendi</span>
            </div>
          )
        )}
      </div>

      {/* Day Footer */}
      <div className="pt-1 border-t border-[var(--color-border)] text-[9px] font-mono text-[var(--color-text-muted)]">
        {hasActivities ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[var(--color-cycling)] font-semibold flex items-center gap-1 text-[8.5px] sm:text-[9px] truncate">
              <span>✓</span> {activities.length} Sesi
            </span>
            <button
              type="button"
              onClick={() => onSelectActivity?.(activities[0])}
              className="text-[var(--color-cycling)] hover:underline cursor-pointer font-semibold ml-auto shrink-0 text-[8.5px] sm:text-[9px]"
            >
              Detail Sesi ↗
            </button>
          </div>
        ) : hasWorkouts ? (
          <div className="flex items-center justify-end w-full">
            <button
              type="button"
              onClick={() => onSelectWorkout(workouts[0])}
              className={`font-semibold hover:underline cursor-pointer text-[8.5px] sm:text-[9px] ${
                hasMissedWorkouts ? "text-[var(--color-alert-red)] hover:opacity-80" : "text-[var(--color-cycling)] hover:opacity-80"
              }`}
            >
              Detail Sesi ↗
            </button>
          </div>
        ) : isFastingDay ? (
          <div className="text-right">
            <span className="text-[var(--color-text-secondary)] font-semibold flex items-center justify-end gap-1">
              <span>🌙</span> Puasa Sunnah
            </span>
          </div>
        ) : isSaturday ? (
          <div className="text-right">
            <span className="text-[var(--color-text-secondary)] font-semibold">Slot Buffer</span>
          </div>
        ) : (
          <div className="text-right">
            <span className={day.isToday ? "text-[var(--color-cycling)] font-semibold" : ""}>Istirahat</span>
          </div>
        )}
      </div>
    </div>
  );
}
