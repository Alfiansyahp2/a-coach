"use client";

import React from "react";
import { Dumbbell } from "lucide-react";

export interface StrengthTelemetryData {
  setsCount?: number;
  repsPerSet?: number;
  weightKg?: number;
}

interface StrengthTelemetryFieldsProps {
  data: StrengthTelemetryData;
  onChange: (data: StrengthTelemetryData) => void;
}

export function StrengthTelemetryFields({ data, onChange }: StrengthTelemetryFieldsProps) {
  const tonnage = ((data.setsCount || 0) * (data.repsPerSet || 0) * (data.weightKg || 0)).toFixed(0);

  const updateField = (key: keyof StrengthTelemetryData, value: number) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-endurance)] font-mono">
        <span className="flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5" />
          TELEMETRI KEKUATAN &amp; TONASE BEBAN
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          Estimasi Tonase: <strong className="text-[var(--color-text-primary)] font-tabular">{tonnage} kg</strong>
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Total Sets</label>
          <input
            type="number"
            min="1"
            value={data.setsCount || ""}
            onChange={(e) => updateField("setsCount", parseInt(e.target.value) || 0)}
            placeholder="e.g. 5"
            className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
          />
        </div>
        <div>
          <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Reps / Set</label>
          <input
            type="number"
            min="1"
            value={data.repsPerSet || ""}
            onChange={(e) => updateField("repsPerSet", parseInt(e.target.value) || 0)}
            placeholder="e.g. 5"
            className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
          />
        </div>
        <div>
          <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Beban Kerja (kg)</label>
          <input
            type="number"
            min="1"
            value={data.weightKg || ""}
            onChange={(e) => updateField("weightKg", parseFloat(e.target.value) || 0)}
            placeholder="e.g. 100"
            className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
          />
        </div>
      </div>
    </div>
  );
}
