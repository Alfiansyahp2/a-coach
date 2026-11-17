"use client";

import React from "react";
import { Clock, Mountain } from "lucide-react";
import { WeeklyActivityRecap, SportRecapBreakdown, WeeklyProMetrics } from "@/lib/domain/analytics/weeklyRecapTypes";

interface WeeklyRecapWorkloadSectionProps {
  activitySummary: WeeklyActivityRecap;
  proMetrics?: WeeklyProMetrics;
}

export function WeeklyRecapWorkloadSection({
  activitySummary: act,
  proMetrics,
}: WeeklyRecapWorkloadSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)]" />
          <span>Beban Kerja Fisik</span>
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {act.total_calories > 0 ? `${act.total_calories} kcal • ` : ""}{act.active_days_count} Hari Aktif
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border-subtle)]">
          <div className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] font-tabular">
            {act.total_distance_km} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">km</span>
          </div>
          <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Total Jarak</div>
        </div>

        <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border-subtle)]">
          <div className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] font-tabular flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-[var(--color-cycling)] shrink-0" />
            <span>{act.formatted_duration}</span>
          </div>
          <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Durasi Gerak</div>
        </div>

        <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border-subtle)]">
          <div className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] font-tabular flex items-center justify-center gap-1">
            <Mountain className="w-3 h-3 text-[var(--color-endurance)] shrink-0" />
            <span>{act.total_elevation_gain_meters}m</span>
          </div>
          <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Elevasi</div>
        </div>
      </div>

      {/* Pro Physiological Load (Foster sRPE & TSS) */}
      {proMetrics && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)]/80 border border-[var(--color-border)] text-[10px]">
          <span className="text-[var(--color-text-secondary)] font-medium">Beban Fisiologis:</span>
          <div className="flex items-center gap-2.5 font-bold font-tabular">
            <span className="text-[var(--color-cycling)]">{proMetrics.foster_srpe_load} AU sRPE</span>
            <span className="text-[var(--color-text-muted)]">•</span>
            <span className="text-[var(--color-text-primary)]">{proMetrics.weekly_tss} TSS</span>
          </div>
        </div>
      )}

      {/* Proportion Ratio Bar */}
      {act.total_distance_km > 0 && (
        <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden flex border border-[var(--color-border)]">
          {act.sport_breakdown.map((s: SportRecapBreakdown) => {
            const pct = Math.round((s.total_distance_km / Math.max(0.1, act.total_distance_km)) * 100);
            const isRun = s.sport_type.toLowerCase().includes("run");
            return (
              <div
                key={s.sport_type}
                style={{ width: `${pct}%`, backgroundColor: isRun ? "var(--color-running)" : "var(--color-cycling)" }}
                className="h-full transition-all duration-700 ease-out"
                title={`${s.sport_type}: ${s.total_distance_km} km (${pct}%)`}
              />
            );
          })}
        </div>
      )}

      {/* Rincian Cabang Olahraga */}
      <div className="space-y-1">
        {act.sport_breakdown.map((s: SportRecapBreakdown) => {
          const isRun = s.sport_type.toLowerCase().includes("run");
          const dotColor = isRun ? "var(--color-running)" : "var(--color-cycling)";
          return (
            <div
              key={s.sport_type}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[var(--color-surface-muted)]/40 border border-[var(--color-border-subtle)] text-[10.5px]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                <span className="font-bold text-[var(--color-text-primary)]">{s.sport_type}</span>
                <span className="text-[var(--color-text-muted)] text-[10px]">({s.session_count} sesi)</span>
              </div>
              <div className="flex items-center gap-2.5 font-tabular">
                <span className="text-[var(--color-text-primary)] font-bold whitespace-nowrap">
                  {s.total_distance_km} km
                </span>
                <span className="text-[var(--color-text-muted)] text-[10px] whitespace-nowrap">
                  {isRun && s.average_pace_formatted ? s.average_pace_formatted : `${s.average_speed_kmh} km/h`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
