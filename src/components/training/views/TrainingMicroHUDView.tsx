"use client";

import React, { useState, useEffect } from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { CalendarWeek } from "../calendarBuilder";
import { formatDistance, formatDuration } from "@/lib/formatters";
import { Terminal, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface TrainingMicroHUDViewProps {
  weeks: CalendarWeek[];
  todayStr: string;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

export function TrainingMicroHUDView({
  weeks,
  todayStr,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: TrainingMicroHUDViewProps) {
  const currentWeekIdx = weeks.findIndex((w) => w.isCurrentWeek);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(currentWeekIdx !== -1 ? currentWeekIdx : 0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const week = weeks[selectedWeekIdx] || weeks[0];
  const day = week?.days[selectedDayIdx] || week?.days[0];

  // Keyboard navigation: [ / ] for week, j / k for day, Enter to select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "]" && selectedWeekIdx < weeks.length - 1) {
        setSelectedWeekIdx((prev) => prev + 1);
      } else if (e.key === "[" && selectedWeekIdx > 0) {
        setSelectedWeekIdx((prev) => prev - 1);
      } else if ((e.key === "j" || e.key === "ArrowRight") && selectedDayIdx < 6) {
        setSelectedDayIdx((prev) => prev + 1);
      } else if ((e.key === "k" || e.key === "ArrowLeft") && selectedDayIdx > 0) {
        setSelectedDayIdx((prev) => prev - 1);
      } else if (e.key === "Enter" && day) {
        const firstA = day.activities[0];
        const firstW = day.workouts[0];
        if (firstA) onSelectActivity?.(firstA);
        else if (firstW) onSelectWorkout(firstW);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWeekIdx, selectedDayIdx, weeks, day, onSelectActivity, onSelectWorkout]);

  return (
    <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] font-mono text-xs space-y-4 shadow-xs">
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)] text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--color-cycling)]" />
          <span className="font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            Micro-HUD Minimalist Mode • Keyboard Navigasi
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          <span>Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] border">[ ]</kbd> Mgg • <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] border">J K</kbd> Hari • <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] border">Enter</kbd> Buka</span>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => selectedWeekIdx > 0 && setSelectedWeekIdx(selectedWeekIdx - 1)}
          disabled={selectedWeekIdx === 0}
          className="p-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-cycling)] disabled:opacity-40"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="font-bold text-xs uppercase text-[var(--color-text-primary)]">
          {week.weekLabel} • {week.focusTitle.split(":")[0]}
        </span>
        <button
          type="button"
          onClick={() => selectedWeekIdx < weeks.length - 1 && setSelectedWeekIdx(selectedWeekIdx + 1)}
          disabled={selectedWeekIdx === weeks.length - 1}
          className="p-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-cycling)] disabled:opacity-40"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7-Days Horizontal Tabs */}
      <div className="grid grid-cols-7 gap-1.5">
        {week.days.map((d, idx) => {
          const isSelected = idx === selectedDayIdx;
          const hasDone = d.activities.length > 0 || d.workouts.some((w) => w.status === "COMPLETED");

          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-[var(--color-cycling)]/15 border-[var(--color-cycling)] text-[var(--color-text-primary)] font-bold shadow-xs ring-1 ring-[var(--color-cycling)]"
                  : "bg-[var(--color-surface-muted)]/40 border-[var(--color-border)] hover:border-[var(--color-text-muted)] text-[var(--color-text-secondary)]"
              }`}
            >
              <div className="text-[9px] uppercase">{d.dayName.slice(0, 3)}</div>
              <div className="text-[12px] font-bold font-tabular">{d.dayNumber}</div>
              {hasDone && <CheckCircle2 className="w-3 h-3 text-[var(--color-cycling)] mx-auto mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Selected Day Telemetry Card */}
      {day && (
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--color-text-primary)]">{day.dayName}, {day.dayNumber} {day.monthName} {day.isToday ? "(HARI INI)" : ""}</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">{day.status}</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {day.workouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between text-[11px] p-2 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] font-tabular">
                <div>
                  <span className="font-bold text-[var(--color-text-primary)]">{w.workout_category}</span>
                  <span className="text-[var(--color-text-secondary)] ml-2">
                    {w.target_distance_meters ? formatDistance(w.target_distance_meters) : formatDuration(w.target_duration_seconds || 0)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectWorkout(w)}
                  className="text-[var(--color-cycling)] font-semibold hover:underline"
                >
                  Buka Dossier ↗
                </button>
              </div>
            ))}

            {day.activities.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-[11px] p-2 rounded bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 font-tabular">
                <span className="font-bold text-[var(--color-cycling)]">✓ {a.name} ({formatDistance(a.distance_meters)} • {formatDuration(a.moving_time_seconds)})</span>
                <button
                  type="button"
                  onClick={() => onSelectActivity?.(a)}
                  className="text-[var(--color-cycling)] font-semibold hover:underline"
                >
                  Detail Sesi ↗
                </button>
              </div>
            ))}

            {!day.workouts.length && !day.activities.length && (
              <div className="text-[10px] text-[var(--color-text-muted)] italic py-2">
                Tidak ada sesi terjadwal • Jeda pemulihan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

