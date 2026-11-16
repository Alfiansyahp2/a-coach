"use client";

import React from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { CalendarWeek } from "../calendarBuilder";
import { GanttMiniPMCSparkline } from "../gantt/GanttMiniPMCSparkline";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { Bike, Footprints, Zap, ShieldCheck } from "lucide-react";

interface TrainingPeriodizationGanttViewProps {
  weeks: CalendarWeek[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

export function TrainingPeriodizationGanttView({
  weeks,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: TrainingPeriodizationGanttViewProps) {
  return (
    <div className="space-y-4 font-mono">
      {/* 1. Header Strip */}
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div>
          <h2 className="text-xs uppercase font-bold text-[var(--color-text-primary)] tracking-wide flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Meso-Periodization Gantt Horizon (Makrosiklus 12-Minggu)</span>
          </h2>
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            Visualisasi blok latihan linier terpadu untuk pemantauan superkompensasi dan target Century Ride 100km.
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] font-bold">
            Fase 1–3 Terhubung
          </span>
        </div>
      </div>

      {/* 2. Horizontal Gantt Swimlanes Container */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-4 overflow-x-auto">
        <div className="min-w-[760px] space-y-4">
          {/* Phase Blocks Strip */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)]">
              <span className="font-bold text-[10.5px] text-[var(--color-cycling)] block">FASE 1: ADAPTASI FONDASI</span>
              <span className="text-[8.5px] text-[var(--color-text-muted)]">Minggu 1 – 4 (Target 18–26 km)</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)]">
              <span className="font-bold text-[10.5px] text-purple-600 dark:text-purple-400 block">FASE 2: VOLUME &amp; DELOAD</span>
              <span className="text-[8.5px] text-[var(--color-text-muted)]">Minggu 5 – 8 (Target 30–36 km • Deload M8)</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)]">
              <span className="font-bold text-[10.5px] text-[var(--color-endurance)] block">FASE 3: SPESIFISITAS ZONE 2</span>
              <span className="text-[8.5px] text-[var(--color-text-muted)]">Minggu 9 – 12 (Target 40–48 km • Deload M12)</span>
            </div>
          </div>

          {/* 12-Week Workout Bars Horizon */}
          <div className="space-y-2">
            {weeks.map((week) => {
              const effectiveDist = week.completedDistanceMeters > 0 ? week.completedDistanceMeters : week.scheduledDistanceMeters;

              return (
                <div
                  key={week.weekNumber}
                  className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${
                    week.isCurrentWeek
                      ? "bg-[var(--color-cycling)]/[0.04] border-[var(--color-cycling)]/40 ring-1 ring-[var(--color-cycling)]/20"
                      : "bg-[var(--color-surface-muted)]/30 border-[var(--color-border)]/50"
                  }`}
                >
                  {/* Left Label */}
                  <div className="w-24 shrink-0 text-left">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[11px] text-[var(--color-text-primary)]">M{week.weekNumber}</span>
                      {week.isCurrentWeek && (
                        <span className="text-[7.5px] font-bold px-1 py-0.2 rounded bg-[var(--color-cycling)] text-white">
                          AKTIF
                        </span>
                      )}
                      {week.isDeload && (
                        <span className="text-[7.5px] font-bold px-1 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300">
                          DELOAD
                        </span>
                      )}
                    </div>
                    <span className="text-[8.5px] text-[var(--color-text-secondary)] font-tabular">
                      {(effectiveDist / 1000).toFixed(1)} / {week.minTargetKm} km
                    </span>
                  </div>

                  {/* 7 Days Mini Swimlane Blocks */}
                  <div className="flex-1 grid grid-cols-7 gap-1.5">
                    {week.days.map((day) => {
                      const hasWorkouts = day.workouts.length > 0;
                      const hasActivities = day.activities.length > 0;
                      const isFasting = day.dayOfWeek === 0 || day.dayOfWeek === 3;
                      const firstW = day.workouts[0];
                      const firstA = day.activities[0];
                      const isCompleted = hasActivities || firstW?.status === "COMPLETED";

                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          onClick={() => {
                            if (firstA) onSelectActivity?.(firstA);
                            else if (firstW) onSelectWorkout(firstW);
                          }}
                          className={`p-1 rounded text-center truncate text-[8.5px] transition-all border cursor-pointer ${
                            isCompleted
                              ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border-[var(--color-cycling)]/40 font-bold"
                              : hasWorkouts
                              ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-cycling)]"
                              : isFasting
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20"
                              : "bg-[var(--color-surface-muted)]/40 text-[var(--color-text-muted)] border-transparent opacity-60"
                          } ${day.isToday ? "ring-1 ring-[var(--color-cycling)]" : ""}`}
                          title={`${day.dayName}: ${firstA?.name || firstW?.workout_category || (isFasting ? "Puasa Sunnah" : "Rest")}`}
                        >
                          <span className="font-tabular font-bold block">{day.dayName.slice(0, 3)} {day.dayNumber}</span>
                          <span className="text-[7.5px] truncate block opacity-85">
                            {isCompleted ? "✓ Selesai" : hasWorkouts ? (firstW.target_distance_meters ? formatDistance(firstW.target_distance_meters) : formatDuration(firstW.target_duration_seconds || 0)) : (isFasting ? "Puasa" : "Rest")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Banister PMC Curve Stream */}
          <GanttMiniPMCSparkline weeks={weeks} />
        </div>
      </div>
    </div>
  );
}

