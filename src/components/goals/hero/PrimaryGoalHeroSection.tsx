import React from "react";
import Link from "next/link";
import { Sparkles, Target, ArrowRight, ShieldCheck } from "lucide-react";
import { FitnessGoal } from "@/types";

interface PrimaryGoalHeroSectionProps {
  primaryGoal: FitnessGoal;
}

export function PrimaryGoalHeroSection({ primaryGoal }: PrimaryGoalHeroSectionProps) {
  const currentNum = Number(primaryGoal.current_value);
  const targetNum = Number(primaryGoal.target_value);
  const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));
  const isKm = primaryGoal.unit === "km" || primaryGoal.goal_type === "DISTANCE_MONTHLY";
  const unit = primaryGoal.unit || (isKm ? "km" : "sesi");

  return (
    <section className="rounded-2xl border-2 border-[var(--color-cycling)] bg-gradient-to-br from-[var(--color-cycling)]/15 via-[var(--color-surface-card)] to-[var(--color-surface-muted)]/60 p-5 sm:p-7 space-y-5 shadow-md relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-border)]/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black px-3 py-1 rounded-full bg-[var(--color-cycling)] text-[var(--color-canvas)] uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>★ TARGET UTAMA YANG SEDANG DIPERJUANGKAN</span>
            </span>
            <span className="text-[11px] font-mono text-[var(--color-cycling)] font-bold">
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
            className="px-4 py-2 rounded-xl bg-[var(--color-cycling)] text-[var(--color-canvas)] text-xs font-mono font-bold hover:opacity-90 transition-all shadow-xs flex items-center gap-2"
          >
            <span>Buka Kalender Latihan 12-Minggu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Telemetry Progress & Peak Effort Comparison */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[var(--color-cycling)]" />
              <span>Rekor Terbaik Sekali Jalan vs Target Puncak:</span>
            </span>
            <span className="font-mono text-base font-black text-[var(--color-cycling)] tabular-nums">
              {pct}%
            </span>
          </div>

          <div className="w-full h-3.5 bg-[var(--color-surface-card)] rounded-full overflow-hidden border border-[var(--color-border)] p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-[var(--color-cycling)] transition-all duration-700 shadow-sm"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--color-text-primary)]">
              Rekor Terjauh Saat Ini:{" "}
              <strong className="text-sm font-black tabular-nums text-[var(--color-cycling)]">
                {currentNum.toFixed(1)} {unit}
              </strong>{" "}
              <span className="text-[var(--color-text-muted)] text-[11px]">(Sekali Aktivitas)</span>
            </span>
            <span className="text-[var(--color-text-primary)]">
              Target Puncak:{" "}
              <strong className="text-sm font-black tabular-nums">
                {targetNum.toFixed(1)} {unit}
              </strong>
            </span>
          </div>
        </div>

        {/* 3 Pillar Metrics of the Primary Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[var(--color-surface-card)]/80 border border-[var(--color-border)]">
            <span className="text-[10px] uppercase text-[var(--color-text-muted)] block">
              Target Spesifikasi
            </span>
            <span className="font-bold text-[var(--color-text-primary)] mt-1 block">
              Sekali Aktivitas (Single Effort)
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              Bukan akumulasi jarak berkala
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-card)]/80 border border-[var(--color-border)]">
            <span className="text-[10px] uppercase text-[var(--color-text-muted)] block">
              Jadwal Tonggak Mingguan
            </span>
            <span className="font-bold text-[var(--color-cycling)] mt-1 block">
              Setiap Minggu (Sunday Peak)
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              12 Tonggak Progresif Berjenjang
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-card)]/80 border border-[var(--color-border)]">
            <span className="text-[10px] uppercase text-[var(--color-text-muted)] block">
              Selang Pemulihan Puasa
            </span>
            <span className="font-bold text-[var(--color-endurance)] mt-1 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Senin &amp; Kamis Terproteksi</span>
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">
              Puasa Sunnah: Beban = 0 Sesi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

