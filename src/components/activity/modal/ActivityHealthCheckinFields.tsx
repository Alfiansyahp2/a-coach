"use client";

import React from "react";
import { Gauge, ShieldCheck, HeartPulse } from "lucide-react";

interface ActivityHealthCheckinFieldsProps {
  rpeScore: number;
  setRpeScore: (v: number) => void;
  painScale: number;
  setPainScale: (v: number) => void;
  swellingObserved: boolean;
  setSwellingObserved: (v: boolean) => void;
  instabilityObserved: boolean;
  setInstabilityObserved: (v: boolean) => void;
}

export function ActivityHealthCheckinFields({
  rpeScore,
  setRpeScore,
  painScale,
  setPainScale,
  swellingObserved,
  setSwellingObserved,
  instabilityObserved,
  setInstabilityObserved,
}: ActivityHealthCheckinFieldsProps) {
  return (
    <div className="p-4 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-3.5 font-mono text-xs">
      <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
        <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          CHECK-IN INTENSITAS ZONE 2 &amp; STATUS KESEHATAN SENDI
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">Audit Klinis Sesi</span>
      </div>

      {/* RPE Selector (1 to 10) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[var(--color-cycling)]" />
            <span>Skala Intensitas RPE (Borg CR10)</span>
          </label>
          <span className="text-[10px] font-bold text-[var(--color-cycling)]">
            Skor: {rpeScore} / 10{" "}
            {rpeScore <= 2
              ? "(Sangat Ringan / Recovery)"
              : rpeScore <= 4
              ? "(Zone 2 Aerobik • Talk Test Nyaman)"
              : rpeScore <= 6
              ? "(Moderat / Ambang Aerobik)"
              : "(Tinggi / Mendekati Anaerobik)"}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 font-tabular">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isZone2 = num === 3 || num === 4;
            const isSelected = rpeScore === num;

            return (
              <button
                type="button"
                key={num}
                onClick={() => setRpeScore(num)}
                className={`py-1.5 rounded-md text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-[var(--color-cycling)] text-white border-[var(--color-cycling)] shadow-xs"
                    : isZone2
                    ? "bg-[var(--color-surface-card)] border-[var(--color-cycling)]/40 text-[var(--color-cycling)] hover:bg-[var(--color-surface-card)]"
                    : "bg-[var(--color-surface-card)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <p className="text-[9.5px] text-[var(--color-text-secondary)] leading-tight">
          Target program: <strong>RPE 3–4</strong>. Anda dapat berbicara dalam kalimat penuh tanpa terengah-engah sepanjang sesi.
        </p>
      </div>

      {/* Joint Pain Scale (0-10) */}
      <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[var(--color-alert-red)]" />
            <span>Skala Nyeri Sendi (Engkel Kanan &amp; Kedua Lutut)</span>
          </label>
          <span
            className={`text-[10px] font-bold ${
              painScale === 0 ? "text-[var(--color-cycling)]" : painScale <= 3 ? "text-[var(--color-alert-amber)]" : "text-[var(--color-alert-red)]"
            }`}
          >
            {painScale === 0
              ? "0 / 10 (Bebas Nyeri Sepenuhnya)"
              : `${painScale} / 10 (${painScale <= 3 ? "Nyeri Ringan Terkontrol" : "Nyeri Berarti / Perlu Istirahat"})`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            value={painScale}
            onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-cycling)]"
          />
          <span
            className={`font-bold font-tabular text-sm w-6 text-right ${
              painScale === 0 ? "text-[var(--color-cycling)]" : "text-[var(--color-alert-red)]"
            }`}
          >
            {painScale}
          </span>
        </div>
      </div>

      {/* Circuit Breakers: Swelling & Instability */}
      <div className="pt-2 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <label className="flex items-center gap-2 p-2 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] cursor-pointer">
          <input
            type="checkbox"
            checked={swellingObserved}
            onChange={(e) => setSwellingObserved(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-alert-red)]"
          />
          <span className="text-[11px] text-[var(--color-text-primary)]">
            Ada Pembengkakan Sendi?
          </span>
        </label>

        <label className="flex items-center gap-2 p-2 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] cursor-pointer">
          <input
            type="checkbox"
            checked={instabilityObserved}
            onChange={(e) => setInstabilityObserved(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-alert-red)]"
          />
          <span className="text-[11px] text-[var(--color-text-primary)]">
            Ada Ketidakstabilan / Rasa Goyang?
          </span>
        </label>
      </div>
    </div>
  );
}
