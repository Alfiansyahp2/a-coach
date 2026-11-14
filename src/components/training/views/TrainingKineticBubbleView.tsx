"use client";

import React from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { CalendarWeek } from "../calendarBuilder";
import { KineticDayBubble } from "../kinetic/KineticDayBubble";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { Bike, Footprints, Moon, CheckCircle2, Zap } from "lucide-react";

interface TrainingKineticBubbleViewProps {
  weeks: CalendarWeek[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

const BUBBLE_DAYS_HEADER = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];

export function TrainingKineticBubbleView({
  weeks,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: TrainingKineticBubbleViewProps) {
  return (
    <div className="space-y-4 font-mono">
      {/* 1. View Header with Legend */}
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div>
          <h2 className="text-xs uppercase font-bold text-[var(--color-text-primary)] tracking-wide flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-cycling)] animate-pulse" />
            <span>Strava Kinetic Bubble Matrix • 12-Minggu Momentum</span>
          </h2>
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            Matriks ritme volume 12-minggu. Skala radius sebanding durasi sesi latihan.
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[9.5px] text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[var(--color-cycling)]" />
            <span>Selesai</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[var(--color-cycling)]/25 border border-[var(--color-cycling)]" />
            <span>MTB Rencana</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[var(--color-running)]/25 border border-[var(--color-running)]" />
            <span>Lari Rencana</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-purple-500/25 border border-purple-500" />
            <span>Puasa Sunnah</span>
          </div>
        </div>
      </div>

      {/* 2. The 12-Week Matrix Table */}
      <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day Names Header */}
          <div className="grid grid-cols-8 text-center text-xs font-bold text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 py-2">
            <div className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">MINGGU</div>
            {BUBBLE_DAYS_HEADER.map((d) => (
              <div key={d} className="text-[10px]">{d}</div>
            ))}
          </div>

          {/* Weeks Loop */}
          <div className="divide-y divide-[var(--color-border)]/40">
            {weeks.map((week) => {
              const effectiveDist = week.completedDistanceMeters > 0 ? week.completedDistanceMeters : week.scheduledDistanceMeters;

              return (
                <div
                  key={week.weekNumber}
                  className={`grid grid-cols-8 items-center py-2 px-2 transition-colors ${
                    week.isCurrentWeek
                      ? "bg-[var(--color-cycling)]/[0.04]"
                      : "hover:bg-[var(--color-surface-muted)]/20"
                  }`}
                >
                  {/* Column 1: Week Label & Stats */}
                  <div className="space-y-0.5 pr-2 border-r border-[var(--color-border)]/40 text-left">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[10.5px] uppercase text-[var(--color-text-primary)]">
                        M{week.weekNumber}
                      </span>
                      {week.isCurrentWeek && (
                        <span className="text-[7px] font-extrabold px-1.5 py-0.2 rounded-full bg-[var(--color-cycling)] text-white">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-[var(--color-text-secondary)] font-tabular">
                      {(effectiveDist / 1000).toFixed(1)} / {week.minTargetKm} km
                    </div>
                    {week.estimatedWeeklyTss > 0 && (
                      <div className="text-[8px] text-[var(--color-cycling)] font-semibold flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        <span>~{week.estimatedWeeklyTss} TSS</span>
                      </div>
                    )}
                  </div>

                  {/* Columns 2-8: 7 Day Bubbles */}
                  {week.days.map((day) => (
                    <KineticDayBubble
                      key={day.dateStr}
                      day={day}
                      onSelectWorkout={onSelectWorkout}
                      onSelectActivity={onSelectActivity}
                      isRunningCategory={isRunningCategory}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

