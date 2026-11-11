"use client";

import React from "react";

interface PostCheckinSymptomChecklistProps {
  swelling: boolean;
  setSwelling: (v: boolean) => void;
  instability: boolean;
  setInstability: (v: boolean) => void;
}

export function PostCheckinSymptomChecklist({
  swelling,
  setSwelling,
  instability,
  setInstability,
}: PostCheckinSymptomChecklistProps) {
  return (
    <div className="p-3.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg space-y-2.5">
      <span className="text-[10px] uppercase font-bold text-[var(--color-text-primary)] tracking-wider block">
        2. Indikator Biologis &amp; Pembatasan Keamanan
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] cursor-pointer">
          <span className="text-[11px] text-[var(--color-text-primary)]">
            Pembengkakan Sendi Teramati?
          </span>
          <input
            type="checkbox"
            checked={swelling}
            onChange={(e) => setSwelling(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-alert-red)]"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] cursor-pointer">
          <span className="text-[11px] text-[var(--color-text-primary)]">
            Ketidakstabilan / Sendi Goyang?
          </span>
          <input
            type="checkbox"
            checked={instability}
            onChange={(e) => setInstability(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-alert-red)]"
          />
        </label>
      </div>
    </div>
  );
}

