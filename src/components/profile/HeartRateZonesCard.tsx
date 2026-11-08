"use client";

import React from "react";
import { HeartRateZone } from "@/lib/domain/physiology/heartRateZones";
import { Heart, Info, Target, Zap } from "lucide-react";

interface HeartRateZonesCardProps {
  zones: HeartRateZone[];
  rhr: number;
  maxHr: number;
}

export function HeartRateZonesCard({ zones, rhr, maxHr }: HeartRateZonesCardProps) {
  const hrr = maxHr - rhr;

  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Heart className="w-4 h-4 text-[var(--color-running)]" />
            <span>Spektrum 5 Zona Denyut Jantung (Karvonen HRR)</span>
          </h3>
          <p className="text-[10.5px] font-mono text-[var(--color-text-muted)] mt-0.5">
            Dikalibrasi dari RHR {rhr} bpm &amp; HRmax {maxHr} bpm (Cadangan Denyut: {hrr} bpm)
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 text-[10px] font-mono font-bold self-start sm:self-auto">
          <Target className="w-3 h-3" />
          <span>FOKUS: ZONA 2 AEROBIK</span>
        </div>
      </div>

      {/* 5-Zone Progress Visualization & Cards */}
      <div className="space-y-2.5">
        {zones.map((z) => {
          const isTargetZone = z.zone === 2;
          return (
            <div
              key={z.zone}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                isTargetZone
                  ? "bg-[var(--color-cycling)]/5 border-[var(--color-cycling)]/40 shadow-xs ring-1 ring-[var(--color-cycling)]/20"
                  : "bg-[var(--color-surface-muted)]/40 border-[var(--color-border)] hover:border-[var(--color-border)]/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Left: Zone Badge & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 text-[var(--color-canvas)] shadow-2xs"
                    style={{ backgroundColor: z.accentColor }}
                  >
                    Z{z.zone}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
                        {z.nameId}
                      </span>
                      {isTargetZone && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-cycling)] text-[var(--color-canvas)] font-bold uppercase tracking-wider">
                          Target Utama
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] block truncate">
                      {z.description}
                    </span>
                  </div>
                </div>

                {/* Right: BPM Range & HRR Percentage */}
                <div className="flex items-baseline sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 font-mono pt-1 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-base sm:text-lg font-black font-tabular tracking-tight"
                      style={{ color: z.accentColor }}
                    >
                      {z.minBpm} – {z.maxBpm}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">bpm</span>
                  </div>
                  <span className="text-[9.5px] text-[var(--color-text-secondary)] font-medium">
                    {z.percentHrrMin}% – {z.percentHrrMax}% HRR
                  </span>
                </div>
              </div>

              {/* Target benefit chip */}
              <div className="mt-2 pt-2 border-t border-[var(--color-border)]/50 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
                <span className="truncate pr-2">
                  <strong className="text-[var(--color-text-secondary)] font-semibold">Tujuan Preskripsi:</strong> {z.targetSportBenefit}
                </span>
                <span className="shrink-0 text-[var(--color-text-secondary)]">
                  Level Beban: {z.zone}/5
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

