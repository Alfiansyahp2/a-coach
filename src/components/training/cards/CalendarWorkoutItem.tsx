"use client";

import React from "react";
import { ScheduledWorkout } from "@/types";
import { CheckCircle2, XCircle, Zap, Bike, Footprints, ShieldAlert } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/formatters";

interface CalendarWorkoutItemProps {
  workout: ScheduledWorkout;
  isPastDay: boolean;
  onSelect: (workout: ScheduledWorkout) => void;
  isRunningCategory: (category: string) => boolean;
}

export function CalendarWorkoutItem({
  workout: w,
  isPastDay,
  onSelect,
  isRunningCategory,
}: CalendarWorkoutItemProps) {
  const isRun = isRunningCategory(w.workout_category);
  const isCycling = w.workout_category === "Cycling";
  const isCompleted = w.status === "COMPLETED";
  const isMissed = !isCompleted && (w.status === "MISSED" || isPastDay);

  return (
    <button
      key={w.id}
      type="button"
      onClick={() => onSelect(w)}
      className={`w-full text-left p-2 rounded-lg border transition-all space-y-1 block shadow-xs hover:-translate-y-0.5 cursor-pointer font-mono ${
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
          className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
            isMissed
              ? "bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)]"
              : isRun
              ? "bg-[var(--color-running)]/20 text-[var(--color-running)]"
              : isCycling
              ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)]"
              : "bg-[var(--color-alert-amber)]/20 text-[var(--color-alert-amber)]"
          }`}
        >
          {isCycling ? <Bike className="w-2.5 h-2.5 shrink-0" /> : isRun ? <Footprints className="w-2.5 h-2.5 shrink-0" /> : <ShieldAlert className="w-2.5 h-2.5 shrink-0" />}
          <span>{isRun ? "LARI" : isCycling ? "EASY MTB" : "REHAB"}</span>
        </span>

        {isCompleted && (
          <div className="flex items-center gap-1 text-[var(--color-cycling)]">
            <span className="text-[7.5px] font-bold">SELESAI</span>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          </div>
        )}
        {isMissed && (
          <div className="flex items-center gap-1 text-[var(--color-alert-red)]">
            <span className="text-[7.5px] font-bold bg-[var(--color-alert-red)]/15 px-1 py-0.2 rounded border border-[var(--color-alert-red)]/30">
              TERLEWAT
            </span>
            <XCircle className="w-3.5 h-3.5 shrink-0" />
          </div>
        )}
      </div>

      {w.milestone_target_km && (
        <div className="flex items-center gap-1 text-[7.5px] font-bold text-[var(--color-endurance)] bg-[var(--color-endurance)]/10 px-1 py-0.5 rounded border border-[var(--color-endurance)]/25">
          <Zap className="w-2.5 h-2.5 text-[var(--color-endurance)] shrink-0" />
          <span className="truncate">TONGGAK ({w.milestone_target_km} KM)</span>
        </div>
      )}

      <div className={`font-bold text-[10.5px] leading-tight font-tabular ${
        isMissed ? "text-[var(--color-alert-red)]/90" : "text-[var(--color-text-primary)]"
      }`}>
        {w.target_duration_seconds ? formatDuration(w.target_duration_seconds) : w.target_distance_meters ? formatDistance(w.target_distance_meters) : "--"}
      </div>

      <div className={`text-[8px] truncate ${
        isMissed ? "text-[var(--color-alert-red)]/80 font-medium" : "text-[var(--color-text-secondary)]"
      }`}>
        {isMissed ? "Sesi terlewat • Jadwalkan ulang" : (w.target_intensity || "Zone 2 • RPE 3–4")}
      </div>
    </button>
  );
}

