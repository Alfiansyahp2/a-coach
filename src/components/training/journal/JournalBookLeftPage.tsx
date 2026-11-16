"use client";

import React from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { CalendarDay } from "../calendarBuilder";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { CheckCircle2, Bike, Footprints, Moon } from "lucide-react";

interface JournalBookLeftPageProps {
  days: CalendarDay[]; // Monday (0) to Thursday (3)
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

export function JournalBookLeftPage({
  days,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: JournalBookLeftPageProps) {
  return (
    <div className="p-4 sm:p-5 rounded-l-2xl bg-[var(--color-surface-card)] border-y border-l border-[var(--color-border)] shadow-md space-y-4 font-mono relative overflow-hidden">
      {/* Subtle notebook page header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]/60 text-xs text-[var(--color-text-muted)]">
        <span className="font-bold tracking-wider uppercase text-[10px]">LEMBAR 1: SENIN – KAMIS</span>
        <span className="text-[9px] font-tabular">JURNAL LATIHAN LAPANGAN</span>
      </div>

      {/* 4 Days: Monday to Thursday */}
      <div className="space-y-3.5 divide-y divide-[var(--color-border)]/30">
        {days.map((day) => {
          const isFasting = day.dayOfWeek === 0 || day.dayOfWeek === 3;
          const hasWorkouts = day.workouts.length > 0;
          const hasActivities = day.activities.length > 0;

          return (
            <div key={day.dateStr} className="pt-3 first:pt-0 space-y-1.5">
              {/* Day Header Row */}
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

                {isFasting && (
                  <span className="text-[8.5px] font-semibold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                    <Moon className="w-2.5 h-2.5" />
                    <span>Puasa Sunnah</span>
                  </span>
                )}
              </div>

              {/* Day Content */}
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
                  {isFasting ? "Regenerasi glikogen & istirahat penuh tanpa beban impak sendi." : "Jeda pemulihan otot & adaptasi mitokondria."}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

