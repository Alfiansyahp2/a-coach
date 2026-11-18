"use client";

import React, { useState, useMemo } from "react";
import { CalendarDayCard } from "../CalendarDayCard";
import { CalendarWeek } from "../calendarBuilder";
import { ScheduledWorkout, Activity, AuthoritativeAthleteHealthContext } from "@/types";
import { CalendarWeekRowHeader } from "./CalendarWeekRowHeader";
import { CalendarFocusWeekNavigator } from "./CalendarFocusWeekNavigator";
import { CalendarClinicalReadinessStrip } from "./CalendarClinicalReadinessStrip";
import { Eye, Layers, Compass } from "lucide-react";

interface TrainingCalendarGridViewProps {
  displayedWeeks: CalendarWeek[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectActivity?: (activity: Activity) => void;
  isRunningCategory: (category: string) => boolean;
  todayStr?: string;
  healthContext?: AuthoritativeAthleteHealthContext | null;
}

const DAY_HEADERS = [
  { name: "SENIN", subtitle: "(PUASA)", color: "text-purple-600 dark:text-purple-400" },
  { name: "SELASA", subtitle: "(EASY MTB)", color: "text-[var(--color-cycling)]" },
  { name: "RABU", subtitle: "(OPSI/REHAB)", color: "text-[var(--color-alert-amber)]" },
  { name: "KAMIS", subtitle: "(PUASA)", color: "text-purple-600 dark:text-purple-400" },
  { name: "JUMAT", subtitle: "(RECOVERY)", color: "text-[var(--color-cycling)]" },
  { name: "SABTU", subtitle: "(BUFFER)", color: "text-[var(--color-text-secondary)]" },
  { name: "MINGGU", subtitle: "(LONG MTB)", color: "text-[var(--color-cycling)]" },
];

export function TrainingCalendarGridView({
  displayedWeeks,
  onSelectWorkout,
  onSelectActivity,
  isRunningCategory,
  todayStr,
  healthContext,
}: TrainingCalendarGridViewProps) {
  // Calendar sub-mode: "focus" (1 week at a time) or "all" (full 12-week grid)
  const [calendarSubMode, setCalendarSubMode] = useState<"focus" | "all">("all");
  const [collapsedWeeks, setCollapsedWeeks] = useState<Record<number, boolean>>({});

  const currentDayIndex = useMemo(() => {
    if (!todayStr) return -1;
    const parts = todayStr.split("-").map(Number);
    if (parts.length !== 3) return -1;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return (d.getDay() + 6) % 7; // Monday = 0, ..., Sunday = 6
  }, [todayStr]);

  const currentWeekIdx = useMemo(() => {
    return displayedWeeks.findIndex((w) => w.isCurrentWeek);
  }, [displayedWeeks]);

  const [focusWeekIdx, setFocusWeekIdx] = useState<number>(() => {
    return currentWeekIdx !== -1 ? currentWeekIdx : 0;
  });

  const toggleCollapse = (weekNum: number) => {
    setCollapsedWeeks((prev) => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const handleJumpToToday = () => {
    if (currentWeekIdx !== -1) {
      setFocusWeekIdx(currentWeekIdx);
      if (calendarSubMode === "all") {
        const el = document.getElementById(`cal-day-${todayStr}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const weeksToRender = calendarSubMode === "focus"
    ? [displayedWeeks[focusWeekIdx] || displayedWeeks[0]].filter(Boolean)
    : displayedWeeks;

  return (
    <div className="space-y-4 font-mono">
      {/* 1. Clinical Readiness & Safety HUD */}
      <CalendarClinicalReadinessStrip healthContext={healthContext || null} />

      {/* 2. Calendar View Density Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase mr-1">Tampilan:</span>
          <button
            type="button"
            onClick={() => setCalendarSubMode("all")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              calendarSubMode === "all"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-bold border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Grid Semua Minggu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCalendarSubMode("focus");
              if (currentWeekIdx !== -1) setFocusWeekIdx(currentWeekIdx);
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              calendarSubMode === "focus"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] font-bold border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[var(--color-running)]" />
            <span>Fokus Minggu Ini</span>
          </button>
        </div>

        {todayStr && (
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Lompat ke Hari Ini</span>
          </button>
        )}
      </div>

      {/* 3. Focus Week Navigator (When Focus Mode is Active) */}
      {calendarSubMode === "focus" && (
        <CalendarFocusWeekNavigator
          weeks={displayedWeeks}
          selectedWeekIdx={focusWeekIdx}
          onSelectWeekIdx={setFocusWeekIdx}
          onJumpToCurrentWeek={handleJumpToToday}
          currentWeekIdx={currentWeekIdx}
        />
      )}

      {/* 4. Day Names Header Row (Mon - Sun) */}
      <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--color-text-muted)] pb-1 border-b border-[var(--color-border)]">
        {DAY_HEADERS.map((col, idx) => {
          const isTodayColumn = currentDayIndex === idx;
          return (
            <div
              key={col.name}
              className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-t-lg transition-all ${
                isTodayColumn
                  ? `${col.color} bg-[var(--color-surface-card)] border-b-2 border-[var(--color-cycling)] font-extrabold shadow-xs`
                  : `${col.color}`
              }`}
            >
              {isTodayColumn && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)] animate-pulse" />
              )}
              <span>{col.name}</span>
              <span className="text-[8.5px] font-normal">{col.subtitle}</span>
            </div>
          );
        })}
      </div>

      {/* 5. Render Weeks */}
      {weeksToRender.map((week) => {
        const isCollapsed = Boolean(collapsedWeeks[week.weekNumber]);

        return (
          <div
            key={week.weekNumber}
            className={`p-4 rounded-xl bg-[var(--color-surface-card)] border space-y-3 shadow-xs transition-all ${
              week.isDeload
                ? "border-purple-500/40 bg-purple-500/[0.03]"
                : week.isCurrentWeek
                ? "border-[var(--color-cycling)]/40 ring-1 ring-[var(--color-cycling)]/25"
                : "border-[var(--color-border)]"
            }`}
          >
            <CalendarWeekRowHeader
              week={week}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => toggleCollapse(week.weekNumber)}
            />

            {/* 7 Days Grid for this week */}
            {!isCollapsed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
                {week.days.map((day) => (
                  <CalendarDayCard
                    key={day.dateStr}
                    day={day}
                    minTargetKm={week.minTargetKm}
                    todayStr={todayStr}
                    onSelectWorkout={onSelectWorkout}
                    onSelectActivity={onSelectActivity}
                    isRunningCategory={isRunningCategory}
                    healthContext={healthContext}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
