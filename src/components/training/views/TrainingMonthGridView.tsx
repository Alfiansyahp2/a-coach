"use client";

import React, { useState, useMemo } from "react";
import { ScheduledWorkout, Activity } from "@/types";
import {
  AVAILABLE_MONTHS,
  buildMonthGrid,
  MonthGridWeek,
} from "../monthGrid/monthCalendarBuilder";
import { MonthDayCell } from "../monthGrid/MonthDayCell";
import { MonthWeekSummaryColumn } from "../monthGrid/MonthWeekSummaryColumn";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";

interface TrainingMonthGridViewProps {
  initialWorkouts: ScheduledWorkout[];
  activities: Activity[];
  filter: "ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED";
  todayStr: string;
  isRunningCategory: (category: string) => boolean;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
}

const MONTH_DAY_HEADERS = [
  { name: "SENIN", subtitle: "(PUASA)", color: "text-purple-600 dark:text-purple-400" },
  { name: "SELASA", subtitle: "(EASY MTB)", color: "text-[var(--color-cycling)]" },
  { name: "RABU", subtitle: "(REHAB)", color: "text-[var(--color-alert-amber)]" },
  { name: "KAMIS", subtitle: "(PUASA)", color: "text-purple-600 dark:text-purple-400" },
  { name: "JUMAT", subtitle: "(RECOVERY)", color: "text-[var(--color-cycling)]" },
  { name: "SABTU", subtitle: "(BUFFER)", color: "text-[var(--color-text-secondary)]" },
  { name: "MINGGU", subtitle: "(LONG MTB)", color: "text-[var(--color-cycling)]" },
];

export function TrainingMonthGridView({
  initialWorkouts,
  activities,
  filter,
  todayStr,
  isRunningCategory,
  onSelectWorkout,
  onSelectActivity,
}: TrainingMonthGridViewProps) {
  // Default to November 2026 (index 0)
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const activeMonth = AVAILABLE_MONTHS[selectedMonthIdx] || AVAILABLE_MONTHS[0];

  const weeks: MonthGridWeek[] = useMemo(() => {
    return buildMonthGrid(
      activeMonth.year,
      activeMonth.month,
      initialWorkouts,
      activities,
      filter,
      todayStr,
      isRunningCategory
    );
  }, [activeMonth, initialWorkouts, activities, filter, todayStr, isRunningCategory]);

  const canGoPrev = selectedMonthIdx > 0;
  const canGoNext = selectedMonthIdx < AVAILABLE_MONTHS.length - 1;

  const handleJumpToToday = () => {
    // If today is in November, set month to 0; if December, 1; if January, 2
    if (!todayStr) return;
    const parts = todayStr.split("-").map(Number);
    if (parts.length === 3) {
      const matchIdx = AVAILABLE_MONTHS.findIndex(
        (m) => m.year === parts[0] && m.month === parts[1] - 1
      );
      if (matchIdx !== -1) setSelectedMonthIdx(matchIdx);
    }
    setTimeout(() => {
      const el = document.getElementById(`month-day-${todayStr}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Month Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canGoPrev && setSelectedMonthIdx(selectedMonthIdx - 1)}
            disabled={!canGoPrev}
            className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${
              canGoPrev
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
                : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
            title="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold uppercase text-[var(--color-text-primary)] tracking-wide px-2">
            {activeMonth.label}
          </span>

          <button
            type="button"
            onClick={() => canGoNext && setSelectedMonthIdx(selectedMonthIdx + 1)}
            disabled={!canGoNext}
            className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${
              canGoNext
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
                : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
            title="Bulan selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Hari Ini</span>
          </button>
        </div>
      </div>

      {/* The 8-Column True Month Grid (Desktop & Tablet) */}
      <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs overflow-hidden">
        {/* Day of Week Headers (7 days + 1 summary column) */}
        <div className="hidden lg:grid grid-cols-8 text-center text-xs font-bold text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/40">
          {MONTH_DAY_HEADERS.map((col) => (
            <div key={col.name} className="py-2.5 px-2 border-r border-[var(--color-border)]/50 flex flex-col items-center justify-center">
              <span className={`text-[10.5px] ${col.color}`}>{col.name}</span>
              <span className="text-[8px] font-normal text-[var(--color-text-muted)]">{col.subtitle}</span>
            </div>
          ))}
          <div className="py-2.5 px-2 text-[10px] text-[var(--color-cycling)] flex items-center justify-center uppercase font-bold tracking-wider">
            RINGKASAN MINGGU
          </div>
        </div>

        {/* Rows of Weeks */}
        <div className="divide-y divide-[var(--color-border)]/50">
          {weeks.map((week) => (
            <div key={week.weekNumber} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              {week.days.map((day) => (
                <MonthDayCell
                  key={day.dateStr}
                  day={day}
                  onSelectWorkout={onSelectWorkout}
                  onSelectActivity={onSelectActivity}
                  isRunningCategory={isRunningCategory}
                />
              ))}
              {/* 8th Column: Weekly Summary */}
              <MonthWeekSummaryColumn week={week} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

