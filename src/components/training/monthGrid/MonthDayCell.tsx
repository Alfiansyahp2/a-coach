"use client";

import React from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { MonthGridDay } from "./monthCalendarBuilder";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { CheckCircle2, Bike, Footprints, ShieldAlert, XCircle, Moon, Zap } from "lucide-react";
import { CalendarDayQuickAction } from "../cards/CalendarDayQuickAction";

interface MonthDayCellProps {
  day: MonthGridDay;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (cat: string) => boolean;
}

export function MonthDayCell({
  day,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: MonthDayCellProps) {
  const hasWorkouts = day.workouts.length > 0;
  const hasActivities = day.activities.length > 0;
  const isFasting = day.status === "FASTING";
  const isBuffer = day.status === "BUFFER";

  return (
    <div
      id={`month-day-${day.dateStr}`}
      className={`group p-2 flex flex-col justify-between border-b border-r border-[var(--color-border)]/50 transition-colors relative min-h-[120px] font-mono ${
        !day.isCurrentMonth
          ? "bg-[var(--color-surface-muted)]/20 opacity-40"
          : day.isToday
          ? "bg-[var(--color-surface-card)] ring-2 ring-inset ring-[var(--color-cycling)]/40 z-10"
          : day.status === "MISSED"
          ? "bg-[var(--color-alert-red)]/[0.03] hover:bg-[var(--color-surface-card)]"
          : isFasting
          ? "bg-purple-500/[0.02] hover:bg-purple-500/[0.05]"
          : "bg-[var(--color-surface-card)]/50 hover:bg-[var(--color-surface-card)]"
      }`}
    >
      {/* 1. Cell Header: Day Number & Today Pill & Quick Add */}
      <div className="flex items-center justify-between text-xs pb-1">
        <span
          className={`font-tabular font-bold text-[12px] leading-none ${
            day.isToday
              ? "text-[var(--color-cycling)] font-extrabold"
              : day.status === "MISSED"
              ? "text-[var(--color-alert-red)]"
              : "text-[var(--color-text-primary)]"
          }`}
        >
          {day.dayNumber}
        </span>

        <div className="flex items-center gap-1">
          {day.isToday && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)] animate-pulse shadow-xs" title="Hari Ini" />
          )}
          {day.isCurrentMonth && (
            <CalendarDayQuickAction
              dateStr={day.dateStr}
              defaultWorkout={day.workouts[0] || null}
            />
          )}
        </div>
      </div>

      {/* 2. Cell Content: Sleek Telemetry Bars */}
      <div className="flex-1 space-y-1 py-1">
        {/* Planned Workouts */}
        {hasWorkouts &&
          day.workouts.map((w) => {
            const isRun = isRunningCategory(w.workout_category);
            const isCycling = w.workout_category === "Cycling";
            const isCompleted = w.status === "COMPLETED";
            const isMissed = day.status === "MISSED";

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => onSelectWorkout(w)}
                className={`w-full text-left px-1.5 py-1 rounded text-[9.5px] border-l-2 transition-all flex items-center justify-between gap-1 cursor-pointer truncate ${
                  isCompleted
                    ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)] text-[var(--color-text-primary)]"
                    : isMissed
                    ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)] text-[var(--color-alert-red)]"
                    : isCycling
                    ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)] text-[var(--color-text-primary)]"
                    : isRun
                    ? "bg-[var(--color-running)]/10 border-[var(--color-running)] text-[var(--color-text-primary)]"
                    : "bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)] text-[var(--color-text-primary)]"
                }`}
              >
                <div className="flex items-center gap-1 truncate">
                  {isCycling ? <Bike className="w-2.5 h-2.5 shrink-0 text-[var(--color-cycling)]" /> : isRun ? <Footprints className="w-2.5 h-2.5 shrink-0 text-[var(--color-running)]" /> : <ShieldAlert className="w-2.5 h-2.5 shrink-0 text-[var(--color-alert-amber)]" />}
                  <span className="font-bold truncate font-tabular">
                    {w.target_distance_meters ? formatDistance(w.target_distance_meters) : w.target_duration_seconds ? formatDuration(w.target_duration_seconds) : "Sesi"}
                  </span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-[var(--color-cycling)] shrink-0" />
                ) : isMissed ? (
                  <XCircle className="w-3 h-3 text-[var(--color-alert-red)] shrink-0" />
                ) : null}
              </button>
            );
          })}

        {/* Recorded Activities */}
        {hasActivities &&
          day.activities.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelectActivity?.(act)}
              className="w-full text-left px-1.5 py-1 rounded text-[9px] border-l-2 border-[var(--color-cycling)] bg-[var(--color-cycling)]/15 text-[var(--color-text-primary)] transition-all flex items-center justify-between gap-1 cursor-pointer font-tabular"
            >
              <span className="font-bold truncate">
                ✓ {formatDistance(act.distance_meters)}
              </span>
              <span className="text-[8px] text-[var(--color-text-secondary)]">
                {formatDuration(act.moving_time_seconds)}
              </span>
            </button>
          ))}

        {/* Quiet Rest / Fasting status */}
        {!hasWorkouts && !hasActivities && (
          isFasting ? (
            <div className="flex items-center gap-1 text-[8.5px] text-purple-600 dark:text-purple-300 font-semibold pt-1">
              <Moon className="w-2.5 h-2.5 shrink-0" />
              <span>Puasa Sunnah</span>
            </div>
          ) : isBuffer ? (
            <div className="flex items-center gap-1 text-[8.5px] text-[var(--color-text-secondary)] pt-1">
              <Zap className="w-2.5 h-2.5 text-[var(--color-cycling)] shrink-0" />
              <span>Buffer Opsional</span>
            </div>
          ) : (
            <div className="text-[8px] text-[var(--color-text-muted)] pt-1">
              Rest Day
            </div>
          )
        )}
      </div>

      {/* 3. Micro Footer */}
      <div className="text-[8px] text-[var(--color-text-muted)] text-right pt-0.5">
        {hasActivities ? `${day.activities.length} sesi dicatat` : hasWorkouts ? "Terjadwal" : ""}
      </div>
    </div>
  );
}

