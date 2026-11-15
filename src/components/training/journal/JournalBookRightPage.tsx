"use client";

import React from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { CalendarDay, CalendarWeek } from "../calendarBuilder";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { CheckCircle2, Bike, Footprints, Zap, Sparkles } from "lucide-react";

interface JournalBookRightPageProps {
  days: CalendarDay[]; // Friday (4) to Sunday (6)
  week: CalendarWeek;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

export function JournalBookRightPage({
  days,
  week,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: JournalBookRightPageProps) {
  const effectiveDist = week.completedDistanceMeters > 0 ? week.completedDistanceMeters : week.scheduledDistanceMeters;
  const effectiveKm = (effectiveDist / 1000).toFixed(1);

  return (
    <div className="p-4 sm:p-5 rounded-r-2xl bg-[var(--color-surface-card)] border-y border-r border-[var(--color-border)] shadow-md space-y-4 font-mono relative overflow-hidden">
      {/* Central spine ribbon bookmark */}
      <div className="absolute top-0 left-0 w-1.5 h-16 bg-[var(--color-cycling)] rounded-b-sm shadow-sm" />

      {/* Notebook page header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]/60 text-xs text-[var(--color-text-muted)] pl-2">
        <span className="font-bold tracking-wider uppercase text-[10px]">LEMBAR 2: JUMAT – MINGGU</span>
        <span className="text-[9px] font-tabular">EVALUASI MIKROSIKLUS</span>
      </div>

      {/* 3 Days: Friday, Saturday, Sunday */}
      <div className="space-y-3 divide-y divide-[var(--color-border)]/30 pl-2">
        {days.map((day) => {
          const isSaturday = day.dayOfWeek === 5;
          const hasWorkouts = day.workouts.length > 0;
          const hasActivities = day.activities.length > 0;

          return (
            <div key={day.dateStr} className="pt-2.5 first:pt-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${day.isToday ? "bg-[var(--color-cycling)] animate-pulse" : "bg-[var(--color-border)]"}`} />
                  <span className="font-bold text-[11px] text-[var(--color-text-primary)] uppercase">
                    {day.dayName}, {day.dayNumber} {day.monthName}
                  </span>
                  {day.isToday && (
                    <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--color-cycling)] text-white">
                      HARI INI
                    </span>
                  )}
                </div>
                {isSaturday && (
                  <span className="text-[8px] text-[var(--color-text-secondary)] font-semibold">
                    Slot Cadangan Buffer
                  </span>
                )}
              </div>

              {hasWorkouts ? (
                day.workouts.map((w) => {
                  const isRun = isRunningCategory(w.workout_category);
                  const isCompleted = w.status === "COMPLETED";

                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => onSelectWorkout(w)}
                      className="w-full text-left p-2 rounded-lg bg-[var(--color-surface-muted)]/40 hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)]/60 transition-all flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isRun ? <Footprints className="w-3.5 h-3.5 text-[var(--color-running)] shrink-0" /> : <Bike className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />}
                        <div className="truncate">
                          <div className="font-bold text-[11px] text-[var(--color-text-primary)] font-tabular truncate">
                            {w.target_distance_meters ? formatDistance(w.target_distance_meters) : w.target_duration_seconds ? formatDuration(w.target_duration_seconds) : "--"}
                            <span className="font-normal text-[var(--color-text-secondary)] ml-1.5">• {w.target_intensity || "Zone 2"}</span>
                          </div>
                          <div className="text-[8px] text-[var(--color-text-muted)] truncate">{w.description || w.workout_category}</div>
                        </div>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-[var(--color-border)] shrink-0 group-hover:border-[var(--color-cycling)]" />
                      )}
                    </button>
                  );
                })
              ) : hasActivities ? (
                day.activities.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => onSelectActivity?.(act)}
                    className="w-full text-left p-2 rounded-lg bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 text-xs flex items-center justify-between cursor-pointer font-tabular"
                  >
                    <span className="font-bold text-[10.5px] text-[var(--color-text-primary)]">
                      ✓ {formatDistance(act.distance_meters)} ({formatDuration(act.moving_time_seconds)})
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                  </button>
                ))
              ) : (
                <div className="text-[9px] text-[var(--color-text-muted)] italic pl-4 border-l-2 border-[var(--color-border)]/40">
                  {isSaturday ? "Opsi recovery spin jika target volume mingguan belum terpenuhi." : "Jeda pemulihan sebelum masuk siklus minggu baru."}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Catatan Pelatih Mingguan (Coach Marginalia Box) */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-1.5 ml-2">
        <div className="flex items-center justify-between text-[9.5px]">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1 uppercase">
            <Sparkles className="w-3 h-3 text-[var(--color-cycling)]" />
            <span>Catatan Pelatih {week.weekLabel.split("(")[0]}</span>
          </span>
          <span className="font-tabular font-bold text-[var(--color-cycling)]">
            {effectiveKm} / {week.minTargetKm} km ({week.targetAchievedPct}%)
          </span>
        </div>
        <p className="text-[8.5px] text-[var(--color-text-secondary)] leading-relaxed">
          {week.focusTitle}. Pertahankan ritme kayuhan stabil 85 RPM di Zone 2 dan proteksi sendi engkel pada hari puasa.
        </p>
      </div>
    </div>
  );
}

