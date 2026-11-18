"use client";

import React from "react";

interface EditProfileBiometricsTabProps {
  age: string;
  setAge: (v: string) => void;
  heightCm: string;
  setHeightCm: (v: string) => void;
  weightKg: string;
  setWeightKg: (v: string) => void;
  rhr: string;
  setRhr: (v: string) => void;
  maxHr: string;
  setMaxHr: (v: string) => void;
  trainingDays: string;
  setTrainingDays: (v: string) => void;
  liveBmi: number;
}

export function EditProfileBiometricsTab({
  age,
  setAge,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  rhr,
  setRhr,
  maxHr,
  setMaxHr,
  trainingDays,
  setTrainingDays,
  liveBmi,
}: EditProfileBiometricsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Usia (Tahun)
          </label>
          <input
            type="number"
            min="15"
            max="90"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
        </div>

        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Tinggi Badan (cm)
          </label>
          <input
            type="number"
            step="0.5"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
        </div>

        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Berat Badan (kg)
          </label>
          <input
            type="number"
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
        </div>

        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Resting HR (bpm)
          </label>
          <input
            type="number"
            min="35"
            max="110"
            value={rhr}
            onChange={(e) => setRhr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
        </div>

        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Max HR (bpm)
          </label>
          <input
            type="number"
            min="140"
            max="220"
            value={maxHr}
            onChange={(e) => setMaxHr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          />
        </div>

        <div>
          <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
            Hari Latihan / Minggu
          </label>
          <select
            value={trainingDays}
            onChange={(e) => setTrainingDays(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
          >
            <option value="2">2 Hari / Minggu</option>
            <option value="3">3 Hari / Minggu (Rekomendasi Pemulihan)</option>
            <option value="4">4 Hari / Minggu</option>
            <option value="5">5 Hari / Minggu</option>
            <option value="6">6 Hari / Minggu</option>
          </select>
        </div>
      </div>

      {/* Live Calculated BMI Callout */}
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
            Kalkulasi BMI Real-Time
          </span>
          <span className="text-sm font-bold text-[var(--color-cycling)]">
            {liveBmi} kg/m² • {liveBmi <= 24.9 ? "Ideal Atletik" : "Di Luar Batas Standar"}
          </span>
        </div>
        <div className="text-right text-[10.5px] text-[var(--color-text-muted)]">
          HR Reserve: <strong className="text-[var(--color-text-primary)]">{(Number(maxHr) || 188) - (Number(rhr) || 68)} bpm</strong>
        </div>
      </div>
    </div>
  );
}

