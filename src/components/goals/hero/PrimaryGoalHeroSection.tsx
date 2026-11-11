import React from "react";
import Link from "next/link";
import { Target, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { FitnessGoal } from "@/types";

interface PrimaryGoalHeroSectionProps {
  primaryGoal: FitnessGoal;
}

export function PrimaryGoalHeroSection({ primaryGoal }: PrimaryGoalHeroSectionProps) {
  const currentNum = Number(primaryGoal.current_value);
  const targetNum = Number(primaryGoal.target_value);
  const pct = Math.min(100, Math.round((currentNum / Math.max(1, targetNum)) * 100));
  const isKm = primaryGoal.unit === "km" || primaryGoal.goal_type === "DISTANCE_MONTHLY";
  const unit = primaryGoal.unit || (isKm ? "km" : "sesi");

  // Tachometer Half-Circle Arc Parameters (Radius = 60, Path length = Math.PI * 60 ~= 188.5)
  const arcRadius = 60;
  const arcLength = Math.PI * arcRadius;
  const arcOffset = arcLength - (pct / 100) * arcLength;

  return (
    <section className="rounded-xl border border-[var(--color-border)] border-t-2 border-t-[var(--color-cycling)] bg-[var(--color-surface-card)] p-5 sm:p-6 space-y-5 shadow-xs relative overflow-hidden font-mono">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-[var(--color-cycling)] uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Target className="w-3.5 h-3.5" />
              <span>★ TARGET UTAMA YANG SEDANG DIPERJUANGKAN</span>
            </span>
            <span className="text-[11px] text-[var(--color-cycling)] font-bold">
              Driver Kalender 12-Minggu
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-sans text-[var(--color-text-primary)]">
            {primaryGoal.title}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Target ini berstatus <strong>Target Puncak Sekali Aktivitas (Single Session Peak Effort)</strong>. Seluruh 36 sesi latihan, volume mingguan, dan selang pemulihan dikalibrasi eksklusif untuk mencapai target puncak ini.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/training"
            className="px-4 py-2 rounded-xl bg-[var(--color-cycling)] text-[var(--color-canvas)] text-xs font-bold hover:opacity-90 transition-all shadow-xs flex items-center gap-2 group"
          >
            <span>Buka Kalender Latihan 12-Minggu</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Telemetry Tachometer Arc & Comparison Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Semi-Circular Radial Tachometer Gauge (Instrument-Grade) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] relative">
          <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>RADIAL TACHOMETER TELEMETRI</span>
          </div>

          <div className="relative w-48 h-26 overflow-hidden flex items-end justify-center">
            <svg viewBox="0 0 140 75" className="w-48 h-26">
              {/* Background Arc */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke="var(--color-surface-card)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Active Progress Arc */}
              <path
                d="M 10 70 A 60 60 0 0 1 130 70"
                fill="none"
                stroke="var(--color-cycling)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={arcOffset}
                className="transition-[stroke-dashoffset] duration-1000 ease-out"
              />
            </svg>

            {/* Numeric Readout Nestled Inside Arch */}
            <div className="absolute bottom-0 inset-x-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black font-tabular text-[var(--color-text-primary)] leading-none">
                {pct}%
              </span>
              <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] font-bold tracking-wider mt-0.5">
                Pencapaian Target
              </span>
            </div>
          </div>

          {/* Scale Milestones */}
          <div className="w-full flex justify-between px-2 pt-2 text-[10px] text-[var(--color-text-muted)] font-tabular border-t border-[var(--color-border)] mt-2">
            <span>0 km</span>
            <span>25 km</span>
            <span>50 km</span>
            <span>75 km</span>
            <span className="text-[var(--color-cycling)] font-bold">{targetNum.toFixed(0)} km</span>
          </div>
        </div>

        {/* Right: Comparative Breakdown & Progress Meters */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)]">Rekor Sekali Aktivitas vs Target:</span>
              <span className="font-tabular font-bold text-[var(--color-cycling)]">
                {currentNum.toFixed(1)} / {targetNum.toFixed(1)} {unit}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[var(--color-surface-muted)] overflow-hidden border border-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-cycling)] transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Tipe Target</span>
              <span className="font-bold text-[var(--color-text-primary)] text-[11px] block mt-0.5">Single Peak Effort</span>
              <span className="text-[9px] text-[var(--color-text-muted)]">Bukan akumulasi</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Jadwal Uji</span>
              <span className="font-bold text-[var(--color-cycling)] text-[11px] block mt-0.5">Minggu ke-12</span>
              <span className="text-[9px] text-[var(--color-text-muted)]">Puncak periodisasi</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
              <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Proteksi Sendi</span>
              <span className="font-bold text-[var(--color-endurance)] text-[11px] block mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Restorasi Puasa</span>
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)]">Senin &amp; Kamis 0 km</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
