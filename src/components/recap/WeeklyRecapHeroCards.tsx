import React from "react";
import { Activity as ActivityIcon, Clock, HeartPulse, ShieldCheck } from "lucide-react";
import { WeeklyActivityRecap, WeeklyInjuryRecap } from "@/lib/domain/analytics/weeklyRecapTypes";

interface WeeklyRecapHeroCardsProps {
  activitySummary: WeeklyActivityRecap;
  injurySummary: WeeklyInjuryRecap;
}

export function WeeklyRecapHeroCards({
  activitySummary: act,
  injurySummary: inj,
}: WeeklyRecapHeroCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Total Jarak Minggu Ini</span>
          <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-text-primary)]">
          {act.total_distance_km} <span className="text-xs font-normal text-[var(--color-text-muted)]">km</span>
        </div>
        <div className="text-[10px] text-[var(--color-text-secondary)]">{act.total_sessions} sesi latihan tercatat</div>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Durasi &amp; Kalori</span>
          <Clock className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-text-primary)]">
          {act.formatted_duration}
        </div>
        <div className="text-[10px] text-[var(--color-text-secondary)]">
          {act.total_calories > 0 ? `${act.total_calories} kcal` : "Aerobik Zone 2"}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Telemetri Nyeri</span>
          <HeartPulse className="w-3.5 h-3.5 text-[var(--color-alert-amber)]" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-text-primary)]">
          {inj.pain_telemetry.average_pain_score} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ 10</span>
        </div>
        <div className="text-[10px] text-[var(--color-text-secondary)]">
          Puncak: {inj.pain_telemetry.peak_pain_score}/10 ({inj.pain_telemetry.peak_pain_location || "Aman"})
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Toleransi Beban</span>
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-cycling)]">
          {inj.training_responses_summary.pain_free_sessions_count} <span className="text-xs font-normal text-[var(--color-text-muted)]">Bebas Nyeri</span>
        </div>
        <div className="text-[10px] text-[var(--color-text-secondary)]">
          {inj.new_injuries_count === 0 ? "0 Insiden Baru" : `${inj.new_injuries_count} Cidera Baru`}
        </div>
      </div>
    </div>
  );
}
