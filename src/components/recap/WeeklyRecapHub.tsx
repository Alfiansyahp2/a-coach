"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  WeeklyActivityAndInjuryRecap,
  RecapScope,
} from "@/lib/domain/analytics/weeklyRecapTypes";
import { formatDateOnly } from "@/lib/formatters";
import { WeeklyRecapTimeline } from "./WeeklyRecapTimeline";
import { WeeklyRecapPrescription } from "./WeeklyRecapPrescription";
import { WeeklyRecapProMetricsSection } from "@/components/analytics/WeeklyRecapProMetricsSection";
import { MultiWeekMesocycleDeck } from "./MultiWeekMesocycleDeck";
import { WeeklyRecapHeroCards } from "./WeeklyRecapHeroCards";
import { WeeklyRecapTacticalBridge } from "./WeeklyRecapTacticalBridge";
import { WeeklyRecapDeloadBanner } from "./WeeklyRecapDeloadBanner";

interface WeeklyRecapHubProps {
  initialRecap: WeeklyActivityAndInjuryRecap;
}

export function WeeklyRecapHub({ initialRecap }: WeeklyRecapHubProps) {
  const [recap, setRecap] = useState<WeeklyActivityAndInjuryRecap>(initialRecap);
  const [scope, setScope] = useState<RecapScope>("1_WEEK");
  const [loading, setLoading] = useState(false);

  const fetchRecap = async (targetDateStr?: string, targetScope?: RecapScope) => {
    try {
      setLoading(true);
      const s = targetScope || scope;
      const d = targetDateStr || formatDateOnly(new Date(recap.timeframe.startDate));
      const res = await fetch(`/api/athlete/weekly-recap?date=${d}&scope=${s}&autoMonday=false`);
      const data = await res.json();
      if (data.success && data.recap) {
        setRecap(data.recap);
      }
    } catch (err) {
      console.error("Failed to fetch weekly recap:", err);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = async (direction: -1 | 1 | 0) => {
    let targetDateStr: string;
    if (direction === 0) {
      targetDateStr = formatDateOnly(new Date());
    } else {
      const currentRef = new Date(recap.timeframe.startDate);
      currentRef.setDate(currentRef.getDate() + direction * 7);
      targetDateStr = formatDateOnly(currentRef);
    }
    await fetchRecap(targetDateStr, scope);
  };

  const handleScopeChange = async (newScope: RecapScope) => {
    setScope(newScope);
    await fetchRecap(undefined, newScope);
  };

  const { timeframe, activity_summary: act, injury_summary: inj, clinical_verdict: verdict } = recap;
  const isCaution = verdict.status === "CAUTION";
  const isSuspended = verdict.status === "SUSPENDED";
  const availableWeeks = recap.availableWeeks || [];

  return (
    <div className="space-y-6 font-mono">
      {/* 0. Banner Momen Refleksi Siklus Tuntas (Senin 00:00) */}
      {recap.isMondayAutoCompleted && (
        <div className="p-4 rounded-xl bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-cycling)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--color-cycling)] text-xs block">
                Senin Dini Hari: Waktu Refleksi Biologis, Bukan Kertas Kosong
              </strong>
              <span className="text-[11px] text-[var(--color-text-secondary)] block mt-0.5 leading-relaxed">
                Secara psikologis, blok 7 hari baru tuntas di Minggu malam ({timeframe.label}) dengan total {act.total_sessions} sesi ({act.total_distance_km} km). Evaluasi ini disajikan agar Anda dapat menyerap hasil adaptasi tubuh sebelum disambut siklus baru.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigateWeek(0)}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] border border-[var(--color-border)] text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
          >
            Mulai Siklus Baru →
          </button>
        </div>
      )}

      {/* Banner Deload Superkompensasi (Jika Siklus Deload Terdeteksi) */}
      {recap.pro_metrics?.deload_info && (
        <WeeklyRecapDeloadBanner deload={recap.pro_metrics.deload_info} />
      )}

      {/* 1. Header Toolbar & Kontrol Scope Multi-Minggu */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-primary)]">
                  REKAP TELEMETRI AKTIVITAS &amp; CIDERA
                </h1>
                <span className="text-[9.5px] px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold uppercase tracking-wider">
                  {scope === "4_WEEKS" ? "Mesosiklus 1 Bulan" : scope === "2_WEEKS" ? "Blok 2-Minggu" : "Siklus 7 Hari"}
                </span>
              </div>
              <span className="text-[11px] text-[var(--color-text-secondary)] block">
                {timeframe.label} • {act.active_days_count} Hari Aktif / {act.rest_days_count} Pemulihan
              </span>
            </div>
          </div>
        </div>

        {/* Kontrol Navigasi & Scope */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-muted)] rounded-lg border border-[var(--color-border)] text-xs">
            {(["1_WEEK", "2_WEEKS", "4_WEEKS"] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => handleScopeChange(sc)}
                disabled={loading}
                className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${
                  scope === sc
                    ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] shadow-xs border border-[var(--color-border)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {sc === "1_WEEK" ? "1 Minggu" : sc === "2_WEEKS" ? "2 Minggu" : "1 Bulan"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg p-1 text-xs">
            <button
              onClick={() => navigateWeek(-1)}
              disabled={loading}
              className="p-1.5 hover:bg-[var(--color-surface-card)] rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer disabled:opacity-40"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-bold text-[var(--color-text-primary)] font-tabular">
              {timeframe.isCurrentWeek ? "Minggu Ini" : `${timeframe.weeksAgo || 1} Mgg Lalu`}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              disabled={loading || timeframe.isCurrentWeek}
              className="p-1.5 hover:bg-[var(--color-surface-card)] rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Historical Weeks Quick-Selector Pills (Zero-Scrollbar) */}
      {availableWeeks.length > 0 && (
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
          <span className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold shrink-0 flex items-center gap-1.5 pl-1.5 pr-1">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span className="hidden sm:inline">PILIH SIKLUS:</span>
            <span className="sm:hidden">SIKLUS:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 pr-1 scroll-smooth">
            {availableWeeks.slice(0, 6).map((w) => {
              const isSelected = w.startDate === timeframe.startDate.split("T")[0];
              return (
                <button
                  key={w.startDate}
                  onClick={() => fetchRecap(w.startDate, scope)}
                  disabled={loading}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-tabular flex items-center gap-1.5 cursor-pointer text-xs ${
                    isSelected
                      ? "bg-[var(--color-cycling)] text-[var(--color-canvas)] font-bold shadow-xs"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)]"
                  }`}
                >
                  {w.isCurrentWeek ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  ) : w.isCompletedWeek ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  ) : null}
                  <span>
                    {w.isCurrentWeek
                      ? "Minggu Berjalan"
                      : w.isCompletedWeek
                      ? "1 Mgg Lalu (Tuntas)"
                      : `${w.weeksAgo} Mgg Lalu`}
                  </span>
                  {w.sessionCount > 0 && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        isSelected ? "bg-black/25 text-white" : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {w.sessionCount} sesi ({w.totalDistanceKm}km)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Multi-Week Mesocycle Deck */}
      {(scope === "2_WEEKS" || scope === "4_WEEKS") && recap.multiWeekRollup && (
        <MultiWeekMesocycleDeck rollup={recap.multiWeekRollup} />
      )}

      {/* 4. Empat Kartu Adaptasi Biologis & Validitas Ganda */}
      <WeeklyRecapHeroCards
        activitySummary={act}
        injurySummary={inj}
        proMetrics={recap.pro_metrics}
      />

      {/* 5. Jembatan Preskriptif Taktis Minggu Depan */}
      {recap.pro_metrics?.tactical_bridge && (
        <WeeklyRecapTacticalBridge prescription={recap.pro_metrics.tactical_bridge} />
      )}

      {/* 6. Banner Protokol Keselamatan Sendi & Korelasi Klinis */}
      <div
        className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 shadow-xs ${
          isSuspended
            ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/30 text-[var(--color-alert-red)]"
            : isCaution
            ? "bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)]/30 text-[var(--color-alert-amber)]"
            : "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30 text-[var(--color-cycling)]"
        }`}
      >
        {isSuspended ? (
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        ) : isCaution ? (
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-bold text-xs uppercase tracking-wide">
            {verdict.joint_safety_status}
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            {verdict.load_vs_injury_correlation}
          </p>
        </div>
      </div>

      {/* 7. Analisis Fisiologis & Polarisasi 80/20 Pro Level */}
      {recap.pro_metrics && (
        <WeeklyRecapProMetricsSection proMetrics={recap.pro_metrics} />
      )}

      {/* 8. Rincian Dua Kolom: Timeline 7 Hari (Kiri) vs Status Cidera & Preskripsi (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <WeeklyRecapTimeline
            dailyBreakdown={act.daily_breakdown}
            totalElevationMeters={act.total_elevation_gain_meters}
          />
        </div>
        <div className="lg:col-span-5">
          <WeeklyRecapPrescription
            injurySummary={inj}
            clinicalVerdict={verdict}
            tacticalBridge={recap.pro_metrics?.tactical_bridge}
          />
        </div>
      </div>
    </div>
  );
}
