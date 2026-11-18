import React from "react";
import { Layers, TrendingUp, Calendar, Zap, ShieldCheck } from "lucide-react";
import { MultiWeekRollupSummary } from "@/lib/domain/analytics/weeklyRecapTypes";

interface MultiWeekMesocycleDeckProps {
  rollup: MultiWeekRollupSummary;
}

export function MultiWeekMesocycleDeck({ rollup }: MultiWeekMesocycleDeckProps) {
  const maxWeekDist = Math.max(1, ...rollup.weeksBreakdown.map((w) => w.distanceKm));
  const isPositiveTrend = rollup.volumeTrendPct >= 0;

  return (
    <div className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 space-y-4 shadow-xs font-mono">
      {/* 1. Header Ringkasan Multi-Minggu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-cycling)]">
              AGREGASI PERIODISASI MULTI-MINGGU
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black font-sans text-[var(--color-text-primary)]">
            {rollup.scopeLabel}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {rollup.dateRangeFormatted} • {rollup.totalSessions} Sesi Tercatat • {rollup.formattedDuration} Waktu Bergerak
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-right">
            <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Total Jarak</span>
            <span className="text-xl sm:text-2xl font-bold font-tabular text-[var(--color-text-primary)] leading-tight">
              {rollup.totalDistanceKm.toFixed(1)} <span className="text-xs font-normal text-[var(--color-text-secondary)]">km</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Metrik Kunci Blok Mesosiklus */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1">
          <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Rata-Rata Mingguan</span>
          <span className="font-bold font-tabular text-[var(--color-text-primary)] text-sm block">
            {rollup.averageWeeklyDistanceKm.toFixed(1)} km
          </span>
          <span className="text-[9px] text-[var(--color-text-muted)] block">Per 7 hari aktif</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1">
          <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Tren Volume</span>
          <span className={`font-bold font-tabular text-sm block flex items-center gap-1 ${isPositiveTrend ? "text-[var(--color-cycling)]" : "text-amber-400"}`}>
            <TrendingUp className={`w-3.5 h-3.5 ${!isPositiveTrend ? "rotate-180" : ""}`} />
            <span>{isPositiveTrend ? `+${rollup.volumeTrendPct}%` : `${rollup.volumeTrendPct}%`}</span>
          </span>
          <span className="text-[9px] text-[var(--color-text-muted)] block truncate">{rollup.mesocyclePhase}</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1">
          <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Konsistensi Siklus</span>
          <span className="font-bold font-tabular text-[var(--color-endurance)] text-sm block">
            {rollup.consistencyScorePct}%
          </span>
          <span className="text-[9px] text-[var(--color-text-muted)] block">Minggu aktif terpenuhi</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1">
          <span className="text-[9.5px] uppercase text-[var(--color-text-muted)] block">Elevasi &amp; Kalori</span>
          <span className="font-bold font-tabular text-[var(--color-text-primary)] text-sm block">
            +{rollup.totalElevationMeters.toLocaleString()}m
          </span>
          <span className="text-[9px] text-[var(--color-text-muted)] block">{rollup.totalCalories.toLocaleString()} kkal</span>
        </div>
      </div>

      {/* 3. Breakdown Minggu per Minggu (Visual Bar Comparison) */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block">
          Distribusi Volume Minggu ke Minggu
        </span>

        <div className="space-y-2">
          {rollup.weeksBreakdown.map((w) => {
            const barPct = Math.min(100, Math.round((w.distanceKm / maxWeekDist) * 100));
            return (
              <div
                key={w.weekNumber}
                className="p-3 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-cycling)] shrink-0" />
                    <span className="font-bold text-[var(--color-text-primary)]">{w.label}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">({w.sessionsCount} sesi)</span>
                  </div>
                  <div className="flex items-center gap-3 font-tabular">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{w.formattedDuration}</span>
                    <strong className="text-xs font-bold text-[var(--color-cycling)]">{w.distanceKm.toFixed(1)} km</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[var(--color-surface-card)] overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-cycling)] transition-all duration-500"
                    style={{ width: `${barPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-tabular pt-0.5">
                  <span className="flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    <span>sRPE Load: {w.srpeLoad}</span>
                  </span>
                  <span>TSS: {w.tss}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Sintesis Analisis Pelatih */}
      <div className="p-3 rounded-xl bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 flex items-start gap-2.5 text-xs">
        <ShieldCheck className="w-4 h-4 text-[var(--color-cycling)] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[var(--color-cycling)] block">Sintesis Periodisasi Siklus:</span>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            {rollup.coachSynthesis}
          </p>
        </div>
      </div>
    </div>
  );
}
