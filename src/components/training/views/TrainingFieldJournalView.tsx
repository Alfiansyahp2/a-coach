"use client";

import React, { useState, useMemo } from "react";
import { ScheduledWorkout, Activity } from "@/types";
import { CalendarWeek } from "../calendarBuilder";
import { JournalBookLeftPage } from "../journal/JournalBookLeftPage";
import { JournalBookRightPage } from "../journal/JournalBookRightPage";
import { ChevronLeft, ChevronRight, Compass, BookOpen } from "lucide-react";

interface TrainingFieldJournalViewProps {
  weeks: CalendarWeek[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
}

export function TrainingFieldJournalView({
  weeks,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
}: TrainingFieldJournalViewProps) {
  const currentWeekIdx = useMemo(() => {
    const idx = weeks.findIndex((w) => w.isCurrentWeek);
    return idx !== -1 ? idx : 0;
  }, [weeks]);

  const [activeWeekIdx, setActiveWeekIdx] = useState(currentWeekIdx);
  const week = weeks[activeWeekIdx] || weeks[0];

  const leftDays = week.days.slice(0, 4); // Mon, Tue, Wed, Thu
  const rightDays = week.days.slice(4, 7); // Fri, Sat, Sun

  const canGoPrev = activeWeekIdx > 0;
  const canGoNext = activeWeekIdx < weeks.length - 1;

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Field Journal Book Top Ribbon & Navigator */}
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--color-cycling)]" />
          <span className="font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            Buku Jurnal Lapangan Latihan • Lembar {week.weekLabel.split("(")[0]}
          </span>
          {week.isCurrentWeek && (
            <span className="text-[7.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[var(--color-cycling)] text-white animate-pulse">
              AKTIF
            </span>
          )}
        </div>

        {/* Page Flipping Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => canGoPrev && setActiveWeekIdx(activeWeekIdx - 1)}
            disabled={!canGoPrev}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
              canGoPrev
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
                : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Lembar Lalu</span>
          </button>

          <button
            type="button"
            onClick={() => canGoNext && setActiveWeekIdx(activeWeekIdx + 1)}
            disabled={!canGoNext}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
              canGoNext
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
                : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
            }`}
          >
            <span>Lembar Lanjut</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveWeekIdx(currentWeekIdx)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:border-[var(--color-cycling)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold flex items-center gap-1 text-xs cursor-pointer shadow-xs"
            title="Lompat ke lembar minggu aktif"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Hari Ini</span>
          </button>
        </div>
      </div>

      {/* 2. Open Book Spread (Left Page & Right Page) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative shadow-lg rounded-2xl">
        <JournalBookLeftPage
          days={leftDays}
          onSelectWorkout={onSelectWorkout}
          onSelectActivity={onSelectActivity}
          isRunningCategory={isRunningCategory}
        />
        <JournalBookRightPage
          days={rightDays}
          week={week}
          onSelectWorkout={onSelectWorkout}
          onSelectActivity={onSelectActivity}
          isRunningCategory={isRunningCategory}
        />
      </div>
    </div>
  );
}

