"use client";

import React from "react";
import { Compass, ShieldCheck, Footprints, Bike, HeartPulse, BedDouble, AlertCircle } from "lucide-react";
import { TacticalBridgePrescription } from "@/lib/domain/analytics/weeklyRecapTypes";

interface WeeklyRecapTacticalBridgeProps {
  prescription?: TacticalBridgePrescription;
}

export function WeeklyRecapTacticalBridge({ prescription }: WeeklyRecapTacticalBridgeProps) {
  if (!prescription) return null;

  const { safe_km_quota, mandatory_rest_days, target_hr_zones, clinical_recovery_action } = prescription;
  const isRunHold = safe_km_quota.running_status === "ON_HOLD";
  const isRunRestricted = safe_km_quota.running_status === "RESTRICTED";

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-5 font-mono space-y-4 shadow-xs">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 flex items-center justify-center text-[var(--color-cycling)] shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                JEMBATAN PRESKRIPTIF MINGGU DEPAN
              </h3>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Arahan Taktis Konkret Berbasis Beban Historis &amp; Ambang Biologis
            </span>
          </div>
        </div>

        <span className="text-[9.5px] font-bold px-2.5 py-1 rounded-md border font-tabular uppercase bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border-[var(--color-border)] self-start sm:self-auto">
          {safe_km_quota.rule_applied}
        </span>
      </div>

      {/* 2. Grid 3 Kolom Arahan Taktis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Kolom 1: Kuota Kilometer Aman */}
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-[var(--color-text-primary)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              <span>Kuota Kilometer Aman</span>
            </span>
            <span className="text-sm font-tabular text-[var(--color-cycling)] font-bold">
              Maks {safe_km_quota.total_max_km} km
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                <Bike className="w-3 h-3 text-[var(--color-cycling)]" /> Sepeda:
              </span>
              <strong className="text-[var(--color-text-primary)] font-tabular">
                Hingga {safe_km_quota.cycling_km_cap} km
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                <Footprints className="w-3 h-3 text-[var(--color-running)]" /> Lari:
              </span>
              <span
                className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                  isRunHold
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : isRunRestricted
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {isRunHold ? "DITANGGUHKAN" : `Maks ${safe_km_quota.running_max_km} km`}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed italic pt-1">
            {safe_km_quota.rationale}
          </p>
        </div>

        {/* Kolom 2: Hari Istirahat Wajib */}
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-[var(--color-text-primary)]">
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hari Istirahat Wajib</span>
            </span>
            <span className="text-sm font-tabular text-cyan-400 font-bold">
              {mandatory_rest_days.count} Hari
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Rekomendasi Hari:</span>
              <div className="flex items-center gap-1">
                {mandatory_rest_days.recommended_days.map((d) => (
                  <span
                    key={d}
                    className="px-1.5 py-0.2 rounded bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-[9.5px] font-bold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed italic pt-1">
            {mandatory_rest_days.rationale}
          </p>
        </div>

        {/* Kolom 3: Target Zona Fisiologis */}
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-[var(--color-text-primary)]">
            <span className="flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
              <span>Target Zona Detak Jantung</span>
            </span>
            <span className="text-sm font-tabular text-[var(--color-endurance)] font-bold">
              &ge; {target_hr_zones.zone1_2_aerobic_min_pct}% Z1–2
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Batas Zona 4–5:</span>
              <strong className="text-[var(--color-text-primary)] font-tabular">
                {target_hr_zones.zone4_5_anaerobic_max_minutes === 0
                  ? "0 Menit (Dilarang)"
                  : `Maks ${target_hr_zones.zone4_5_anaerobic_max_minutes} Menit`}
              </strong>
            </div>
          </div>

          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed italic pt-1">
            Fokus: {target_hr_zones.focus}
          </p>
        </div>
      </div>

      {/* 3. Baris Tindakan Klinis Pemulihan Jaringan */}
      <div className="p-3 rounded-lg bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] flex items-start gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 text-[var(--color-cycling)] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-[var(--color-text-primary)] text-[11px] block">
            Protokol Pemulihan Jaringan Terapan:
          </strong>
          <span className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed block">
            {clinical_recovery_action}
          </span>
        </div>
      </div>
    </div>
  );
}
