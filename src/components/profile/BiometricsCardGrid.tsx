"use client";

import React from "react";
import { User, AthleteProfile } from "@/types";
import {
  Ruler,
  Weight,
  Heart,
  Activity,
  CalendarDays,
  Gauge,
  Sparkles,
} from "lucide-react";

interface BiometricsCardGridProps {
  user: User;
  profile: AthleteProfile | null;
  bmi: number;
  bmiCategoryLabel: string;
}

export function BiometricsCardGrid({
  user,
  profile,
  bmi,
  bmiCategoryLabel,
}: BiometricsCardGridProps) {
  const heightCm = Number(user.height_cm || profile?.height_cm || 170.0);
  const weightKg = Number(user.weight_kg || profile?.weight_kg || 65.0);
  const rhr = Number(user.resting_heart_rate || profile?.resting_heart_rate || 68);
  const maxHr = Number(user.max_heart_rate || 188);
  const hrr = Math.max(0, maxHr - rhr);
  const trainingDays = Number(profile?.training_days_per_week || 3);
  const restDays = 7 - trainingDays;

  // Calculate BMI gauge percentage (15 to 32 range)
  const bmiPct = Math.min(100, Math.max(0, ((bmi - 15) / (32 - 15)) * 100));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
        <h2 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--color-cycling)]" />
          <span>Biometrik &amp; Baseline Kinematik Atlet</span>
        </h2>
        <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[var(--color-cycling)]" />
          <span>Otoritatif Calibrated Metrics</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Tinggi Badan */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-cycling)] space-y-2 shadow-xs transition-all hover:border-[var(--color-border)]/80">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Tinggi Badan</span>
            <Ruler className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-text-primary)]">
                {heightCm.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">cm</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block mt-0.5">
              {(heightCm / 100).toFixed(2)} m stature
            </span>
          </div>
        </div>

        {/* 2. Berat Badan */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-cycling)] space-y-2 shadow-xs transition-all hover:border-[var(--color-border)]/80">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Berat Badan</span>
            <Weight className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-text-primary)]">
                {weightKg.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">kg</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block mt-0.5">
              {(weightKg * 2.20462).toFixed(1)} lbs massa
            </span>
          </div>
        </div>

        {/* 3. BMI (Indeks Massa Tubuh) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-emerald-500 space-y-2 shadow-xs transition-all hover:border-[var(--color-border)]/80">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Indeks BMI</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono font-tabular text-emerald-500">
                {bmi.toFixed(1)}
              </span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-semibold truncate max-w-[80px]">
                Ideal
              </span>
            </div>
            <div className="w-full bg-[var(--color-surface-muted)] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${bmiPct}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[var(--color-text-muted)] block mt-1 truncate">
              {bmiCategoryLabel}
            </span>
          </div>
        </div>

        {/* 4. Resting Heart Rate (RHR) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-alert-red)] space-y-2 shadow-xs transition-all hover:border-[var(--color-border)]/80">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Resting HR</span>
            <Heart className="w-3.5 h-3.5 text-[var(--color-alert-red)] fill-[var(--color-alert-red)]/20 animate-pulse" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-alert-red)]">
                {rhr}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">bpm</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block mt-0.5">
              Cadangan HRR: {hrr} bpm
            </span>
          </div>
        </div>

        {/* 5. Max Heart Rate (HRmax) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-running)] space-y-2 shadow-xs transition-all hover:border-[var(--color-border)]/80">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Max Heart Rate</span>
            <Activity className="w-3.5 h-3.5 text-[var(--color-running)]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-running)]">
                {maxHr}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">bpm</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block mt-0.5 truncate" title="Rumus Tanaka: 208 - (0.7 × umur)">
              Tanaka (208 - 0.7×U)
            </span>
          </div>
        </div>

        {/* 6. Ketersediaan Latihan */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-t-2 border-t-[var(--color-endurance)] space-y-2 shadow-xs transition-all hover:border-[var(--color-border)]/80">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="uppercase text-[10px] font-bold tracking-wider">Ketersediaan</span>
            <CalendarDays className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-endurance)]">
                {trainingDays}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">hari/mgg</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block mt-0.5">
              {restDays} hari recovery aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
