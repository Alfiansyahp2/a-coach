"use client";

import React from "react";
import { AthleteProfile } from "@/types";
import { Zap, Footprints, Bike, Flame, Award, Dumbbell } from "lucide-react";

interface PhysiologicalTelemetryCardProps {
  profile: AthleteProfile | null;
  ftpWatts?: number | null;
  wattsPerKg?: number | null;
  wattsPerKgCategory?: string | null;
  vo2Max?: number | null;
}

export function PhysiologicalTelemetryCard({
  profile,
  ftpWatts,
  wattsPerKg,
  wattsPerKgCategory,
  vo2Max,
}: PhysiologicalTelemetryCardProps) {
  const sports = profile?.preferred_sports || ["Running", "Cycling"];
  const experience = profile?.training_experience || "INTERMEDIATE";

  return (
    <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Kapasitas Fisiologis &amp; Multi-Sport</span>
          </h3>
          <p className="text-[10.5px] font-mono text-[var(--color-text-muted)] mt-0.5">
            Daya Output Aerobik, Nilai Ambang, &amp; Preferensi Lintas Disiplin
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-semibold">
          {experience}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Functional Threshold Power (FTP) Card */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5 text-[var(--color-cycling)]">
              <Zap className="w-3.5 h-3.5" />
              <span>Cycling FTP</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">Ambang 60-Mnt</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-cycling)]">
                {ftpWatts ? `${ftpWatts}` : "165"}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">Watts</span>
            </div>

            {wattsPerKg ? (
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-[var(--color-text-primary)] font-tabular">
                  {wattsPerKg.toFixed(2)} W/kg
                </span>
                <span className="text-[9.5px] text-[var(--color-text-muted)] block">
                  {wattsPerKgCategory || "Fondasi Terlatih"}
                </span>
              </div>
            ) : (
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-[var(--color-text-primary)] font-tabular">
                  2.54 W/kg
                </span>
                <span className="text-[9.5px] text-[var(--color-cycling)] block">
                  Fondasi Aerobik
                </span>
              </div>
            )}
          </div>

          <p className="text-[10px] font-mono text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/60">
            Daya ambang fungsional bersepeda untuk perhitungan preskripsi wattage Zone 2.
          </p>
        </div>

        {/* VO2 Max Estimate Card */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5 text-[var(--color-running)]">
              <Flame className="w-3.5 h-3.5" />
              <span>Kapasitas VO2 Max</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">ml/kg/min</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-running)]">
                {vo2Max ? `${vo2Max}` : "48.5"}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">ml/kg/mnt</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-[var(--color-text-primary)] font-tabular">
                Kategori Baik
              </span>
              <span className="text-[9.5px] text-[var(--color-running)] block">
                Top 25% Usia 20-29
              </span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/60">
            Kapasitas ambilan oksigen maksimal untuk efisiensi aerobik jarak menengah-jauh.
          </p>
        </div>
      </div>

      {/* Preferred Sports Tag Row */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] uppercase font-bold text-[var(--color-text-muted)]">
            Disiplin Utama:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {sports.map((sport) => {
              const isRun = sport.toLowerCase().includes("run");
              const isBike = sport.toLowerCase().includes("cycl") || sport.toLowerCase().includes("ride");
              return (
                <span
                  key={sport}
                  className={`px-2.5 py-1 rounded-md border font-semibold flex items-center gap-1.5 text-[10.5px] ${
                    isRun
                      ? "bg-[var(--color-running)]/10 text-[var(--color-running)] border-[var(--color-running)]/30"
                      : isBike
                      ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                  }`}
                >
                  {isRun && <Footprints className="w-3 h-3" />}
                  {isBike && <Bike className="w-3 h-3" />}
                  {!isRun && !isBike && <Dumbbell className="w-3 h-3" />}
                  <span>{sport}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="text-[10.5px] text-[var(--color-text-muted)]">
          Target Musim: <strong className="text-[var(--color-text-secondary)] font-semibold">Aerobic Foundation</strong>
        </div>
      </div>
    </div>
  );
}

