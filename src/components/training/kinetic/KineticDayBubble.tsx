"use client";

import React, { useState } from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { CalendarDay } from "../calendarBuilder";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { Bike, Footprints, Moon, CheckCircle2 } from "lucide-react";

interface KineticDayBubbleProps {
  day: CalendarDay;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

export function KineticDayBubble({
  day,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: KineticDayBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const workouts = day.workouts || [];
  const activities = day.activities || [];
  const hasDone = activities.length > 0 || workouts.some((w) => w.status === "COMPLETED");
  const isFasting = day.status === "FASTING";
  const isMissed = day.status === "MISSED";

  const totalSec = activities.reduce((acc, a) => acc + Number(a.moving_time_seconds || 0), 0) ||
    workouts.reduce((acc, w) => acc + Number(w.target_duration_seconds || 0), 0);
  const totalMeters = activities.reduce((acc, a) => acc + Number(a.distance_meters || 0), 0) ||
    workouts.reduce((acc, w) => acc + Number(w.target_distance_meters || 0), 0);

  // Determine diameter based on duration: 18px (rest) up to 52px (60m+)
  const diameter = totalSec === 0 ? 20 : Math.min(52, Math.max(26, Math.round((totalSec / 3600) * 48)));

  const firstWorkout = workouts[0];
  const firstAct = activities[0];
  const isCycling = firstWorkout?.workout_category === "Cycling" ||
    firstAct?.sport_type?.toLowerCase().includes("ride") || firstAct?.sport_type?.toLowerCase().includes("cycl");
  const isRun = firstWorkout ? isRunningCategory(firstWorkout.workout_category) :
    firstAct?.sport_type?.toLowerCase().includes("run");

  const bubbleColor = hasDone
    ? "bg-[var(--color-cycling)] text-white shadow-sm ring-2 ring-[var(--color-cycling)]/30"
    : isMissed
    ? "bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/50"
    : isFasting
    ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40"
    : isCycling
    ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40 hover:bg-[var(--color-cycling)]/35"
    : isRun
    ? "bg-[var(--color-running)]/20 text-[var(--color-running)] border border-[var(--color-running)]/40 hover:bg-[var(--color-running)]/35"
    : "bg-[var(--color-surface-muted)]/70 text-[var(--color-text-muted)] border border-[var(--color-border)]";

  const handleClick = () => {
    if (firstAct) onSelectActivity?.(firstAct);
    else if (firstWorkout) onSelectWorkout(firstWorkout);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center p-1.5 font-mono"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Day label above bubble */}
      <span className={`text-[8.5px] font-bold font-tabular pb-1 ${
        day.isToday ? "text-[var(--color-cycling)] font-extrabold" : "text-[var(--color-text-muted)]"
      }`}>
        {day.dayNumber}
      </span>

      {/* The Kinetic Bubble */}
      <button
        type="button"
        onClick={handleClick}
        style={{ width: `${diameter}px`, height: `${diameter}px` }}
        className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${bubbleColor} ${
          day.isToday ? "ring-2 ring-[var(--color-cycling)] ring-offset-2 animate-pulse" : ""
        } ${isHovered ? "scale-115 z-20 shadow-md" : ""}`}
      >
        {hasDone ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        ) : isFasting ? (
          <Moon className="w-3 h-3 text-purple-600 dark:text-purple-300" />
        ) : isCycling ? (
          <Bike className="w-3 h-3 text-[var(--color-cycling)]" />
        ) : isRun ? (
          <Footprints className="w-3 h-3 text-[var(--color-running)]" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]/40" />
        )}
      </button>

      {/* Floating HUD Tooltip */}
      {isHovered && (
        <div className="absolute -top-16 z-50 p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xl text-xs w-44 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-[9px] font-bold pb-1 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-text-secondary)]">{day.dayName}, {day.dayNumber} {day.monthName}</span>
            {hasDone && <span className="text-[var(--color-cycling)]">✓ SELESAI</span>}
          </div>
          <div className="text-[10px] font-bold text-[var(--color-text-primary)] font-tabular pt-1">
            {totalMeters > 0 ? formatDistance(totalMeters) : "--"} {totalSec > 0 ? `• ${formatDuration(totalSec)}` : ""}
          </div>
          <div className="text-[8px] text-[var(--color-text-muted)] truncate">
            {firstAct?.name || firstWorkout?.workout_category || (isFasting ? "Puasa Sunnah" : "Rest")}
          </div>
        </div>
      )}
    </div>
  );
}

