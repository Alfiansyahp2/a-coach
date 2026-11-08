"use client";

import React from "react";
import { HeartPulse, Footprints, Bike, CheckCircle2 } from "lucide-react";
import { WeeklyInjuryRecap, WeeklyClinicalVerdict } from "@/lib/domain/analytics/weeklyRecapTypes";

interface WeeklyRecapPrescriptionProps {
  injurySummary: WeeklyInjuryRecap;
  clinicalVerdict: WeeklyClinicalVerdict;
}

export function WeeklyRecapPrescription({
  injurySummary: inj,
  clinicalVerdict: verdict,
}: WeeklyRecapPrescriptionProps) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
        <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-[var(--color-alert-amber)]" />
          <span>Pengawasan Sendi &amp; Preskripsi</span>
        </h3>
        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
          Protokol Klinis
        </span>
      </div>

      {/* Area Pengawasan Berkelanjutan */}
      <div className="space-y-2">
        <div className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
          Area Sendi yang Dimonitor:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {inj.affected_anatomical_regions.length > 0 ? (
            inj.affected_anatomical_regions.map((reg) => (
              <span
                key={reg}
                className="px-2.5 py-1 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-semibold"
              >
                {reg}
              </span>
            ))
          ) : (
            <span className="text-xs text-[var(--color-text-muted)] italic">
              Tidak ada batasan muskuloskeletal aktif
            </span>
          )}
        </div>
      </div>

      {/* Panduan Spesifik Cabang Olahraga */}
      <div className="space-y-2.5 pt-2 border-t border-[var(--color-border-subtle)]">
        <div className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
          Preskripsi Latihan:
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)]/40 border border-[var(--color-border-subtle)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-running)] uppercase">
            <Footprints className="w-3.5 h-3.5" />
            <span>Cabang Lari (Running)</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            {verdict.running_guidance}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)]/40 border border-[var(--color-border-subtle)] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-cycling)] uppercase">
            <Bike className="w-3.5 h-3.5" />
            <span>Cabang Sepeda (Cycling)</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            {verdict.cycling_guidance}
          </p>
        </div>
      </div>

      {/* Action Items Preskriptif */}
      <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
        <div className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
          Rekomendasi Tindakan Minggu Depan:
        </div>
        <ul className="space-y-1.5 text-[11px] text-[var(--color-text-secondary)]">
          {verdict.actionable_recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

