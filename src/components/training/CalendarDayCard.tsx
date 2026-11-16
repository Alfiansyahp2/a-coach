"use client";

import React from "react";
import { Activity, ScheduledWorkout, AuthoritativeAthleteHealthContext } from "@/types";
import { CalendarWorkoutItem } from "./cards/CalendarWorkoutItem";
import { CalendarActivityItem } from "./cards/CalendarActivityItem";
import { CalendarRestCard } from "./cards/CalendarRestCard";
import { CalendarDayQuickAction } from "./cards/CalendarDayQuickAction";

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
  healthContext?: AuthoritativeAthleteHealthContext | null;
}

export function CalendarDayCard({
  day,
  minTargetKm,
  todayStr,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
  healthContext,
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

  // Health context clearance hints for today
  const readiness = day.isToday ? healthContext?.latestReadiness : null;
  const isRunningOnHold = readiness && (readiness.running_readiness === "ON_HOLD" || readiness.running_readiness === "REQUIRES_CLINICAL_REVIEW");

  return (
    <div
      id={`cal-day-${day.dateStr}`}
      className={`group min-h-[160px] p-2.5 rounded-xl flex flex-col justify-between transition-all duration-150 relative ${
        day.isToday
          ? "bg-[var(--color-surface-card)] border-2 border-[var(--color-cycling)] shadow-md ring-2 ring-[var(--color-cycling)]/25 z-10"
          : hasMissedWorkouts && !hasActivities
          ? "bg-[var(--color-alert-red)]/[0.04] border border-[var(--color-alert-red)]/30 hover:border-[var(--color-alert-red)]/50 shadow-xs"
          : isFastingDay && !hasActivities && !hasWorkouts
          ? "bg-purple-500/[0.03] border border-purple-500/20 shadow-xs"
          : isSaturday && !hasActivities && !hasWorkouts
          ? "bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)]"
          : hasWorkouts || hasActivities
          ? "bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)]/70 shadow-xs"
          : "bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] opacity-75"
      }`}
    >
      {/* 1. Day Header */}
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
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-cycling)] text-white font-extrabold text-[8px] tracking-wider shadow-xs animate-pulse">
              HARI INI
            </span>
          )}

          <span
            className={`font-bold font-tabular text-[11px] ${
              day.isToday
                ? "text-[var(--color-cycling)] font-extrabold"
                : hasMissedWorkouts && !hasActivities
                ? "text-[var(--color-alert-red)]"
                : "text-[var(--color-text-primary)]"
            }`}
          >
            {day.dayNumber} {day.monthName}
          </span>

          {/* Quick Add Button on Hover */}
          <CalendarDayQuickAction
            dateStr={day.dateStr}
            defaultWorkout={workouts[0] || null}
          />
        </div>
      </div>

      {/* 2. Day Body Content */}
      <div className="py-2 flex-1 space-y-1.5 font-mono">
        {hasWorkouts &&
          workouts.map((w) => (
            <CalendarWorkoutItem
              key={w.id}
              workout={w}
              isPastDay={isPastDay}
              onSelect={onSelectWorkout}
              isRunningCategory={isRunningCategory}
            />
          ))}

        {hasActivities &&
          activities.map((act) => (
            <CalendarActivityItem
              key={act.id}
              activity={act}
              onSelect={onSelectActivity}
            />
          ))}

        {!hasWorkouts && !hasActivities && (
          <CalendarRestCard
            dayOfWeek={day.dayOfWeek}
            isToday={day.isToday}
            minTargetKm={minTargetKm}
          />
        )}
      </div>

      {/* 3. Day Footer */}
      <div className="pt-1.5 border-t border-[var(--color-border)] text-[9px] font-mono text-[var(--color-text-muted)]">
        <div className="flex items-center justify-between w-full">
          {hasActivities ? (
            <>
              <span className="text-[var(--color-cycling)] font-semibold flex items-center gap-1 truncate">
                <span>✓</span> {activities.length} Sesi
              </span>
              <button
                type="button"
                onClick={() => onSelectActivity?.(activities[0])}
                className="text-[var(--color-cycling)] hover:underline cursor-pointer font-semibold ml-auto shrink-0"
              >
                Detail ↗
              </button>
            </>
          ) : hasWorkouts ? (
            <>
              {day.isToday && isRunningOnHold && isRunningCategory(workouts[0].workout_category) ? (
                <span className="text-[var(--color-alert-amber)] font-bold text-[8px] truncate">
                  ⚠️ HOLD Lari
                </span>
              ) : (
                <span className="text-[var(--color-text-muted)] truncate">
                  {workouts.length} Terjadwal
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectWorkout(workouts[0])}
                className={`font-semibold hover:underline cursor-pointer ml-auto shrink-0 ${
                  hasMissedWorkouts
                    ? "text-[var(--color-alert-red)] hover:opacity-80"
                    : "text-[var(--color-cycling)] hover:opacity-80"
                }`}
              >
                Detail ↗
              </button>
            </>
          ) : isFastingDay ? (
            <span className="text-purple-600 dark:text-purple-300 font-semibold flex items-center gap-1 ml-auto">
              <span>🌙</span> Puasa Sunnah
            </span>
          ) : isSaturday ? (
            <span className="text-[var(--color-text-secondary)] font-semibold ml-auto">
              Slot Buffer
            </span>
          ) : (
            <span className={`ml-auto ${day.isToday ? "text-[var(--color-cycling)] font-semibold" : ""}`}>
              Istirahat
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
