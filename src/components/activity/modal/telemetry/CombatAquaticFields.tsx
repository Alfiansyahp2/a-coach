"use client";

import React from "react";
import { Swords, Waves } from "lucide-react";

export interface CombatAquaticData {
  roundsCount?: number;
  roundDurationMinutes?: number;
  strokeRateSpm?: number;
  poolLengthMeters?: number;
  averageLapTimeSeconds?: number;
}

interface CombatAquaticFieldsProps {
  isCombat: boolean;
  isAquatic: boolean;
  data: CombatAquaticData;
  onChange: (data: CombatAquaticData) => void;
}

export function CombatAquaticFields({
  isCombat,
  isAquatic,
  data,
  onChange,
}: CombatAquaticFieldsProps) {
  const updateField = (key: keyof CombatAquaticData, value: number) => {
    onChange({ ...data, [key]: value });
  };

  if (isCombat) {
    return (
      <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-running)] font-mono">
          <span className="flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            TELEMETRI BELA DIRI &amp; DENSITAS RONDE
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Protokol SCAT6 &amp; Laktat</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Jumlah Ronde</label>
            <input
              type="number"
              min="1"
              value={data.roundsCount || ""}
              onChange={(e) => updateField("roundsCount", parseInt(e.target.value) || 0)}
              placeholder="e.g. 5"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Durasi / Ronde (mnt)</label>
            <input
              type="number"
              min="1"
              value={data.roundDurationMinutes || ""}
              onChange={(e) => updateField("roundDurationMinutes", parseInt(e.target.value) || 0)}
              placeholder="e.g. 3"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
        </div>
      </div>
    );
  }

  if (isAquatic) {
    const swolfScore = (data.averageLapTimeSeconds || 0) + (data.strokeRateSpm || 0);
    return (
      <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-cycling)] font-mono">
          <span className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5" />
            TELEMETRI AKUATIK &amp; EFISIENSI SWOLF
          </span>
          {swolfScore > 0 && (
            <span className="text-[10px] text-[var(--color-text-muted)]">
              SWOLF Est: <strong className="text-[var(--color-text-primary)]">{swolfScore}</strong>
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Panjang Kolam</label>
            <select
              value={data.poolLengthMeters || 25}
              onChange={(e) => updateField("poolLengthMeters", parseInt(e.target.value) || 25)}
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
            >
              <option value={25}>25 Meter</option>
              <option value={50}>50 Meter</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Kayuhan / Lap</label>
            <input
              type="number"
              value={data.strokeRateSpm || ""}
              onChange={(e) => updateField("strokeRateSpm", parseInt(e.target.value) || 0)}
              placeholder="e.g. 18"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Waktu / Lap (dtk)</label>
            <input
              type="number"
              value={data.averageLapTimeSeconds || ""}
              onChange={(e) => updateField("averageLapTimeSeconds", parseInt(e.target.value) || 0)}
              placeholder="e.g. 30"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
