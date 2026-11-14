"use client";

import React from "react";
import { Heart, Zap, Moon } from "lucide-react";

interface CalendarRestCardProps {
  dayOfWeek: number;
  isToday: boolean;
  minTargetKm: number;
}

export function CalendarRestCard({
  dayOfWeek,
  isToday,
  minTargetKm,
}: CalendarRestCardProps) {
  const isFastingDay = dayOfWeek === 0 || dayOfWeek === 3; // Monday = 0, Thursday = 3
  const isSaturday = dayOfWeek === 5; // Saturday = 5

  if (isFastingDay) {
    return (
      <div className="h-full min-h-[90px] flex flex-col items-center justify-center p-2 text-center rounded-lg bg-purple-500/[0.04] border border-purple-500/20 space-y-1 font-mono">
        <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-300">
          <Moon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[9.5px] font-bold text-purple-600 dark:text-purple-300 tracking-wide">
          Puasa Sunnah
        </span>
        <span className="text-[8px] text-[var(--color-text-secondary)]">
          {dayOfWeek === 0 ? "Regenerasi Glikogen" : "Pemulihan Sel & Sendi"}
        </span>
        <span className="text-[7.5px] text-[var(--color-text-muted)]">
          Bebas Beban Impak
        </span>
      </div>
    );
  }

  if (isSaturday) {
    return (
      <div className="h-full min-h-[90px] flex flex-col justify-between p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all text-left font-mono">
        <div>
          <div className="flex items-center justify-between text-[7.5px] pb-1 border-b border-[var(--color-border)]">
            <span className="font-bold text-[var(--color-text-secondary)]">SABTU BUFFER</span>
            <span className="px-1 py-0.2 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] font-semibold text-[7px] border border-[var(--color-border)]">
              OPSIONAL
            </span>
          </div>
          <div className="my-1.5 space-y-0.5">
            <div className="text-[9px] font-bold text-[var(--color-text-primary)] leading-tight flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-[var(--color-cycling)]" />
              <span>Buffer Mingguan</span>
            </div>
            <p className="text-[7.5px] text-[var(--color-text-secondary)] leading-tight">
              Slot cadangan: Recovery spin jika target ({minTargetKm} km) belum tercapai.
            </p>
          </div>
        </div>
        <div className="pt-1 border-t border-[var(--color-border)] flex items-center justify-between text-[7.5px] text-[var(--color-text-muted)]">
          <span>RPE 1–2</span>
          <span className="text-[var(--color-cycling)] font-medium">Persiapan Minggu</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[90px] flex flex-col items-center justify-center p-2 text-center text-[9.5px] text-[var(--color-text-muted)] rounded-lg font-mono">
      <Heart
        className={`w-4 h-4 mb-1 transition-colors ${
          isToday ? "text-[var(--color-alert-amber)] animate-pulse" : "text-[var(--color-text-muted)]"
        }`}
      />
      <span className={isToday ? "text-[var(--color-text-primary)] font-bold text-[9px]" : "text-[9px]"}>
        Jeda Pemulihan
      </span>
      <span className="text-[7.5px] text-[var(--color-text-muted)]">
        Proteksi Sendi &amp; Mitokondria
      </span>
    </div>
  );
}

