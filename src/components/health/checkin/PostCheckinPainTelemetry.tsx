"use client";

import React from "react";

interface PostCheckinPainTelemetryProps {
  painDuring: number;
  setPainDuring: (v: number) => void;
  painAfter: number;
  setPainAfter: (v: number) => void;
  painNextDay: number;
  setPainNextDay: (v: number) => void;
}

export function PostCheckinPainTelemetry({
  painDuring,
  setPainDuring,
  painAfter,
  setPainAfter,
  painNextDay,
  setPainNextDay,
}: PostCheckinPainTelemetryProps) {
  const getBadgeClass = (score: number) => {
    if (score === 0) {
      return "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40";
    }
    if (score <= 3) {
      return "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/40";
    }
    return "bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)] border border-[var(--color-alert-red)] animate-pulse";
  };

  return (
    <div className="p-3.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg space-y-3">
      <span className="text-[10px] uppercase font-bold text-[var(--color-text-primary)] tracking-wider block">
        1. Skala Nyeri Sendi (0 = Tidak Ada, 10 = Nyeri Berat)
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
            Saat Sesi Latihan
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="10"
              value={painDuring}
              onChange={(e) => setPainDuring(Number(e.target.value))}
              className="w-full accent-[var(--color-cycling)]"
            />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-tabular text-xs shrink-0 transition-all duration-200 ${getBadgeClass(painDuring)}`}>
              {painDuring}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
            Sesaat Pasca Sesi
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="10"
              value={painAfter}
              onChange={(e) => setPainAfter(Number(e.target.value))}
              className="w-full accent-[var(--color-cycling)]"
            />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-tabular text-xs shrink-0 transition-all duration-200 ${getBadgeClass(painAfter)}`}>
              {painAfter}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
            Keesokan Harinya
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="10"
              value={painNextDay}
              onChange={(e) => setPainNextDay(Number(e.target.value))}
              className="w-full accent-[var(--color-cycling)]"
            />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-tabular text-xs shrink-0 transition-all duration-200 ${getBadgeClass(painNextDay)}`}>
              {painNextDay}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

