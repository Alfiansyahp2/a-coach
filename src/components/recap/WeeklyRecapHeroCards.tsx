import React from "react";
import { Activity as ActivityIcon, HeartPulse, ShieldCheck, Flame, Scale, Sparkles } from "lucide-react";
import {
  WeeklyActivityRecap,
  WeeklyInjuryRecap,
  WeeklyProMetrics,
} from "@/lib/domain/analytics/weeklyRecapTypes";

interface WeeklyRecapHeroCardsProps {
  activitySummary: WeeklyActivityRecap;
  injurySummary: WeeklyInjuryRecap;
  proMetrics?: WeeklyProMetrics;
}

export function WeeklyRecapHeroCards({
  activitySummary: act,
  injurySummary: inj,
  proMetrics: pro,
}: WeeklyRecapHeroCardsProps) {
  const dual = pro?.dual_load;
  const bio = pro?.biological_adaptation;
  const deload = pro?.deload_info;

  const srpe = dual?.internal_srpe_load_au ?? pro?.foster_srpe_load ?? 0;
  const costRatio = dual?.internal_cost_ratio_au_per_km ?? (act.total_distance_km > 0 ? Math.round((srpe / act.total_distance_km) * 10) / 10 : 0);
  const isDeload = deload?.is_deload_week || pro?.periodization_phase === "DELOAD_RECOVERY";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
      {/* 1. Validitas Ganda: Beban Eksternal dikawinkan dengan Beban Internal */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Dual-Load (Beban Ganda)</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] font-bold">
            Validitas Ganda
          </span>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-text-primary)] flex items-baseline gap-1.5 flex-wrap">
            <span>{act.total_distance_km} <span className="text-xs font-normal text-[var(--color-text-muted)]">km</span></span>
            <span className="text-xs text-[var(--color-text-muted)]">•</span>
            <span className="text-[var(--color-cycling)]">{srpe} <span className="text-xs font-normal text-[var(--color-text-muted)]">AU</span></span>
          </div>
          <div className="text-[10.5px] text-[var(--color-text-secondary)] mt-0.5">
            {act.formatted_duration} • TSS {pro?.weekly_tss || 0}
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Biaya Metabolik:</span>
          <strong className="text-[var(--color-text-primary)] font-tabular">
            {costRatio} AU / km
          </strong>
        </div>
      </div>

      {/* 2. Rapor Adaptasi Biologis (Kardio & Sistem Saraf Otonom) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
            <span>Adaptasi Biologis</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] font-bold">
            Seiler 80/20
          </span>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-cycling)]">
            {pro?.polarization?.low_zone_pct ?? 85}% <span className="text-xs font-normal text-[var(--color-text-muted)]">Zone 1–2</span>
          </div>
          <div className="text-[10.5px] text-[var(--color-text-secondary)] mt-0.5 truncate">
            {bio?.cardiovascular_label ?? "Purity Aerobik Murni"}
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Saraf Otonom:</span>
          <span className="text-[var(--color-text-secondary)] truncate font-semibold">
            {bio?.autonomic_label ?? "Stabil"}
          </span>
        </div>
      </div>

      {/* 3. Integritas Sendi & Telemetri Nyeri */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-[var(--color-alert-amber)]" />
            <span>Integritas Sendi</span>
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] font-bold">
            {inj.pain_telemetry.swelling_observed_count === 0 ? "Bebas Bengkak" : "Ada Bengkak"}
          </span>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-text-primary)]">
            {inj.pain_telemetry.peak_pain_score} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ 10 Nyeri Puncak</span>
          </div>
          <div className="text-[10.5px] text-[var(--color-text-secondary)] mt-0.5">
            Lokasi: <span className="font-semibold text-[var(--color-text-primary)]">{inj.pain_telemetry.peak_pain_location || "Aman / Tanpa Gejala"}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Proteksi Non-Impak:</span>
          <strong className="text-[var(--color-cycling)] font-tabular">
            {pro?.musculoskeletal?.non_impact_cycling_pct ?? 100}% Sepeda
          </strong>
        </div>
      </div>

      {/* 4. Siklus Latihan & Kesiapan Jaringan (Pengenalan Deload Otomatis) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Fase &amp; Kesiapan</span>
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isDeload
                  ? "bg-[var(--color-cycling)]/20 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40"
                  : "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)]"
            }`}
          >
            {isDeload ? "DELOAD" : "PROGRESIF"}
          </span>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-cycling)]">
            {inj.training_responses_summary.pain_free_sessions_count} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ {act.total_sessions} Sesi Bebas Nyeri</span>
          </div>
          <div className="text-[10.5px] text-[var(--color-text-secondary)] mt-0.5">
            {act.active_days_count} Hari Aktif • {act.rest_days_count} Hari Pemulihan
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)] flex items-center justify-between">
          <span>Status Jaringan:</span>
          <span className="text-[var(--color-text-primary)] font-semibold truncate">
            {bio?.tissue_label ?? "Adaptasi Positif"}
          </span>
        </div>
      </div>
    </div>
  );
}
