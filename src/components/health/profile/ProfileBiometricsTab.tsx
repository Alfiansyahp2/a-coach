"use client";

import React from "react";
import { Heart, Calendar } from "lucide-react";

interface ProfileBiometricsTabProps {
  name: string;
  setName: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  restingHr: string;
  setRestingHr: (v: string) => void;
  heightCm: string;
  setHeightCm: (v: string) => void;
  weightKg: string;
  setWeightKg: (v: string) => void;
  calculatedBmi: string;
  trainingDays: number;
  setTrainingDays: (v: number) => void;
}

export function ProfileBiometricsTab({
  name,
  setName,
  age,
  setAge,
  restingHr,
  setRestingHr,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  calculatedBmi,
  trainingDays,
  setTrainingDays,
}: ProfileBiometricsTabProps) {
  const bmiNum = parseFloat(calculatedBmi);

  return (
    <div className="space-y-4 font-mono">
      {/* Athlete Name & Age */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">
            Nama Atlet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Atlet"
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">
            Usia (Tahun)
          </label>
          <input
            type="number"
            min="12"
            max="90"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
        </div>
      </div>

      {/* Biometric Triad: RHR, Height, Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Resting Heart Rate */}
        <div>
          <label className="block text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[var(--color-alert-red)]">
              <Heart className="w-3 h-3 fill-[var(--color-alert-red)]/20" />
              <span>Resting HR</span>
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">bpm</span>
          </label>
          <input
            type="number"
            min="35"
            max="120"
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-alert-red)]"
            required
          />
          <span className="text-[9px] text-[var(--color-text-muted)] mt-0.5 block">
            Detak jantung bangun pagi
          </span>
        </div>

        {/* Height */}
        <div>
          <label className="block text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1 flex items-center justify-between">
            <span className="text-[var(--color-text-primary)]">Tinggi Badan</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">cm</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="100"
            max="240"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
          <span className="text-[9px] text-[var(--color-text-muted)] mt-0.5 block">
            Postur tubuh atlet
          </span>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-[11px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1 flex items-center justify-between">
            <span className="text-[var(--color-text-primary)]">Berat Badan</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">kg</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="30"
            max="200"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
          <span className="text-[9px] text-[var(--color-text-muted)] mt-0.5 block">
            Bobot aktif saat ini
          </span>
        </div>
      </div>

      {/* Live Dynamic BMI Banner */}
      <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block font-semibold tracking-wider">
            Body Mass Index (BMI) Terhitung
          </span>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-xl font-bold font-tabular text-[var(--color-cycling)]">
              {calculatedBmi}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              kg/m²
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)] text-xs font-semibold">
            {bmiNum < 18.5
              ? "Kategori: Berat Kurang"
              : bmiNum <= 24.9
              ? "Kategori: Normal / Ideal"
              : "Kategori: Kelebihan Bobot"}
          </span>
        </div>
      </div>

      {/* Training Days Availability */}
      <div className="p-4 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2.5">
        <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          KETERSEDIAAN HARI LATIHAN MINGGUAN
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[2, 3, 4, 5].map((days) => (
            <button
              type="button"
              key={days}
              onClick={() => setTrainingDays(days)}
              className={`py-2 rounded-md text-xs font-semibold transition-all ${
                trainingDays === days
                  ? "bg-[var(--color-cycling)] text-white shadow-xs"
                  : "bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {days} Sesi / Minggu
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed pt-1">
          Program diselaraskan untuk 3 sesi utama: <strong>Selasa</strong> (Easy), <strong>Jumat</strong> (Recovery), dan <strong>Minggu</strong> (Long Endurance). Senin &amp; Kamis dialokasikan istirahat penuh.
        </p>
      </div>
    </div>
  );
}
