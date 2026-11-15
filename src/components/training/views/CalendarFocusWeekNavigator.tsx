"use client";

import React from "react";
import { CalendarWeek } from "../calendarBuilder";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";

interface CalendarFocusWeekNavigatorProps {
  weeks: CalendarWeek[];
  selectedWeekIdx: number;
  onSelectWeekIdx: (idx: number) => void;
  onJumpToCurrentWeek: () => void;
  currentWeekIdx: number;
}

export function CalendarFocusWeekNavigator({
  weeks,
  selectedWeekIdx,
  onSelectWeekIdx,
  onJumpToCurrentWeek,
  currentWeekIdx,
}: CalendarFocusWeekNavigatorProps) {
  const currentWeek = weeks[selectedWeekIdx] || weeks[0];
  const canGoPrev = selectedWeekIdx > 0;
  const canGoNext = selectedWeekIdx < weeks.length - 1;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] font-mono text-xs shadow-xs">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => canGoPrev && onSelectWeekIdx(selectedWeekIdx - 1)}
          disabled={!canGoPrev}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
            canGoPrev
              ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
              : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Minggu Sebelumnya</span>
        </button>

        <button
          type="button"
          onClick={() => canGoNext && onSelectWeekIdx(selectedWeekIdx + 1)}
          disabled={!canGoNext}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
            canGoNext
              ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] cursor-pointer"
              : "opacity-40 cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          <span>Minggu Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Week Selector Dropdown & Jump to Active Week */}
      <div className="flex items-center gap-2">
        <select
          value={selectedWeekIdx}
          onChange={(e) => onSelectWeekIdx(Number(e.target.value))}
          className="bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[var(--color-cycling)]"
        >
          {weeks.map((w, idx) => (
            <option key={w.weekNumber} value={idx}>
              M{w.weekNumber}: {w.focusTitle.slice(0, 36)}... {w.isCurrentWeek ? "★ (Aktif)" : ""}
            </option>
          ))}
        </select>

        {currentWeekIdx !== -1 && (
          <button
            type="button"
            onClick={onJumpToCurrentWeek}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedWeekIdx === currentWeekIdx
                ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                : "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)]"
            }`}
            title="Lompat ke Minggu Berjalan saat ini"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Hari Ini</span>
          </button>
        )}
      </div>
    </div>
  );
}

