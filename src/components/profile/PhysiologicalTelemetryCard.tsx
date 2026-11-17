"use client";

import React from "react";
import { AthleteProfile } from "@/types";
import { Zap, Footprints, Bike, Flame, Sparkles, Activity, ShieldCheck, HelpCircle } from "lucide-react";

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
  const isFtpCalibrated = Boolean(profile?.physiological_measurements?.ftp_watts);
  const isVo2Calibrated = Boolean(profile?.physiological_measurements?.vo2_max);

  // Fallback modelled values for aerobic base calculations
  const displayFtp = ftpWatts ?? 165;
  const displayWkg = wattsPerKg ?? 2.54;
  const displayVo2 = vo2Max ?? 48.5;

  return (
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-4 shadow-xs">
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
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[var(--color-cycling)]" />
          <span>{experience}</span>
        </span>
      </div>

      {/* Grid: FTP & VO2 Max */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Functional Threshold Power (FTP) Card */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] border-t-2 border-t-[var(--color-cycling)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5 text-[var(--color-cycling)]">
              <Zap className="w-3.5 h-3.5" />
              <span>Cycling FTP</span>
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
              isFtpCalibrated
                ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)] border-[var(--color-border)]"
            }`}>
              {isFtpCalibrated ? "Calibrated" : "Model Estimasi"}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-cycling)]">
                {displayFtp}
              </span>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">Watts</span>
            </div>

            <div className="text-right font-mono">
              <span className="text-sm font-bold text-[var(--color-text-primary)] font-tabular">
                {displayWkg.toFixed(2)} W/kg
              </span>
              <span className="text-[9.5px] text-[var(--color-cycling)] block">
                {wattsPerKgCategory || "Fondasi Aerobik"}
              </span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/50">
            Daya ambang untuk preskripsi wattage Zone 2 (Target: 90–120 W).
          </p>
        </div>

        {/* VO2 Max Estimate Card */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] border-t-2 border-t-[var(--color-running)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)]">
            <span className="uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5 text-[var(--color-running)]">
              <Flame className="w-3.5 h-3.5" />
              <span>Kapasitas VO2 Max</span>
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
              isVo2Calibrated
                ? "bg-[var(--color-running)]/10 text-[var(--color-running)] border-[var(--color-running)]/30"
                : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)] border-[var(--color-border)]"
            }`}>
              {isVo2Calibrated ? "Lab Calibrated" : "Estimasi Usia"}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono font-tabular text-[var(--color-running)]">
                {displayVo2}
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

          <p className="text-[10px] font-mono text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/50">
            Kapasitas ambilan oksigen aerobik untuk daya tahan jarak jauh.
          </p>
        </div>
      </div>

      {/* Cross-Training Discipline Matrix */}
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/30 border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[var(--color-text-primary)]">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Alokasi &amp; Pembagian Latihan Lintas Disiplin</span>
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Target: 3 Hari / Minggu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {/* MTB Cycling */}
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] flex items-center justify-center shrink-0 mt-0.5">
              <Bike className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--color-text-primary)] text-[11px]">MTB Cycling (70%)</span>
                <span className="text-[9px] font-bold text-[var(--color-cycling)]">AKTIF ZONE 2</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Fokus volume aerobik rendah impak. Kadens &gt;80 RPM pada rute datar.
              </p>
            </div>
          </div>

          {/* Running Rehab */}
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[var(--color-running)]/15 text-[var(--color-running)] flex items-center justify-center shrink-0 mt-0.5">
              <Footprints className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--color-text-primary)] text-[11px]">Running Rehab (30%)</span>
                <span className="text-[9px] font-bold text-[var(--color-alert-amber)]">TRANSISI HOLD</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Protokol transisi Return-to-Run. Jalan cepat &amp; walk-jog konservatif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
