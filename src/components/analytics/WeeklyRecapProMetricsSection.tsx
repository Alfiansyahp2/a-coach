"use client";

import React from "react";
import { WeeklyProMetrics } from "@/lib/domain/analytics/weeklyRecapTypes";
import { Activity, Flame, ShieldCheck, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";

interface WeeklyRecapProMetricsSectionProps {
  proMetrics?: WeeklyProMetrics;
}

export function WeeklyRecapProMetricsSection({
  proMetrics,
}: WeeklyRecapProMetricsSectionProps) {
  if (!proMetrics) return null;

  const {
    foster_srpe_load,
    weekly_tss,
    training_monotony,
    training_strain,
    polarization,
    wow_delta,
    musculoskeletal,
    periodization_phase,
    next_week_bridge_advice,
  } = proMetrics;

  const isDeload = periodization_phase === "DELOAD_RECOVERY";
  const isSpike = wow_delta.safety_flag === "SPIKE_WARNING";
  const isOptimalPol = polarization.is_optimal_polarized;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-5 font-mono space-y-4 shadow-xs">
      {/* 1. Header with Periodization Phase Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 flex items-center justify-center text-[var(--color-cycling)] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                ANALISIS BEBAN FISIOLOGIS &amp; POLARISASI PRO
              </h3>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Model Stephen Seiler 80/20 &amp; Foster sRPE Workload
            </span>
          </div>
        </div>

        <span
          className={`text-[9.5px] font-bold px-2.5 py-1 rounded-md border font-tabular uppercase self-start sm:self-auto ${
            isDeload
              ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
              : isSpike
              ? "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border-[var(--color-border)]"
          }`}
        >
          Fase: {periodization_phase.replace(/_/g, " ")}
        </span>
      </div>

      {/* 2. Four Metric Telemetry Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <Activity className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Foster sRPE Load</span>
          </div>
          <span className="text-lg sm:text-xl font-bold font-tabular text-[var(--color-text-primary)] mt-1 block">
            {foster_srpe_load} <span className="text-xs font-normal text-[var(--color-text-muted)]">AU</span>
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5">
            Beban Stres Internal
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <Flame className="w-3.5 h-3.5 text-[var(--color-running)]" />
            <span>Weekly TSS</span>
          </div>
          <span className="text-lg sm:text-xl font-bold font-tabular text-[var(--color-cycling)] mt-1 block">
            {weekly_tss}
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5">
            Training Stress Score
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>WoW Volume Delta</span>
          </div>
          <span
            className={`text-lg sm:text-xl font-bold font-tabular mt-1 block ${
              isSpike ? "text-[var(--color-alert-amber)]" : "text-[var(--color-text-primary)]"
            }`}
          >
            {wow_delta.distance_change_pct >= 0 ? `+${wow_delta.distance_change_pct}%` : `${wow_delta.distance_change_pct}%`}
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5 truncate">
            {wow_delta.safety_flag}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Proteksi Sendi</span>
          </div>
          <span className="text-base sm:text-lg font-bold font-tabular text-[var(--color-cycling)] mt-1 block truncate">
            {musculoskeletal.non_impact_cycling_pct}% MTB
          </span>
          <span className="text-[9px] text-[var(--color-text-secondary)] block mt-0.5 truncate">
            {musculoskeletal.joint_safety_rating.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* 3. Seiler 80/20 Polarized Horizontal Stacked Bar */}
      <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[var(--color-text-primary)]">
            Distribusi Intensitas Polarisasi (Seiler 3-Zone)
          </span>
          <span
            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border font-tabular ${
              isOptimalPol
                ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                : "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
            }`}
          >
            {polarization.classification.replace(/_/g, " ")}
          </span>
        </div>

        {/* Stacked Bar */}
        <div className="w-full h-3 rounded-full bg-[var(--color-surface-card)] overflow-hidden flex border border-[var(--color-border)]">
          <div
            style={{ width: `${polarization.low_zone_pct}%` }}
            className="h-full bg-[var(--color-cycling)] transition-all duration-500"
            title={`Zone 1-2 (Rendah): ${polarization.low_zone_pct}%`}
          />
          <div
            style={{ width: `${polarization.moderate_zone_pct}%` }}
            className="h-full bg-[var(--color-alert-amber)] transition-all duration-500"
            title={`Zone 3 (Sedang): ${polarization.moderate_zone_pct}%`}
          />
          <div
            style={{ width: `${polarization.high_zone_pct}%` }}
            className="h-full bg-[var(--color-alert-red)] transition-all duration-500"
            title={`Zone 4-5 (Tinggi): ${polarization.high_zone_pct}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--color-text-secondary)] pt-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-cycling)] inline-block" />
              <span>Zone 1–2 (Aerobik): <strong>{polarization.low_zone_pct}%</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-alert-amber)] inline-block" />
              <span>Zone 3 (Tempo): <strong>{polarization.moderate_zone_pct}%</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-alert-red)] inline-block" />
              <span>Zone 4–5: <strong>{polarization.high_zone_pct}%</strong></span>
            </span>
          </div>

          <span className="text-[10px] text-[var(--color-text-muted)] italic">
            Target Pro: &ge;75% di Zone 1–2
          </span>
        </div>
      </div>

      {/* 4. Pro Coach Next Week Bridge Advice */}
      <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] space-y-1">
        <span className="text-[11px] font-bold text-[var(--color-text-primary)] block">
          Rekomendasi Jembatan Pelatih untuk Minggu Depan:
        </span>
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
          {next_week_bridge_advice}
        </p>
      </div>
    </div>
  );
}

