"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity as ActivityIcon,
  Clock,
  HeartPulse,
  FileSpreadsheet,
} from "lucide-react";
import { WeeklyActivityAndInjuryRecap } from "@/lib/domain/analytics/weeklyRecapTypes";
import { WeeklyRecapTimeline } from "./WeeklyRecapTimeline";
import { WeeklyRecapPrescription } from "./WeeklyRecapPrescription";

interface WeeklyRecapHubProps {
  initialRecap: WeeklyActivityAndInjuryRecap;
}

export function WeeklyRecapHub({ initialRecap }: WeeklyRecapHubProps) {
  const [recap, setRecap] = useState<WeeklyActivityAndInjuryRecap>(initialRecap);
  const [loading, setLoading] = useState(false);
  const [currentOffsetDays, setCurrentOffsetDays] = useState(0);

  const fetchWeekRecap = async (offsetDays: number) => {
    try {
      setLoading(true);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + offsetDays);
      const dateStr = targetDate.toISOString().slice(0, 10);

      const res = await fetch(`/api/athlete/weekly-recap?date=${dateStr}`);
      const data = await res.json();
      if (data.success && data.recap) {
        setRecap(data.recap);
        setCurrentOffsetDays(offsetDays);
      }
    } catch (err) {
      console.error("Failed to fetch weekly recap:", err);
    } finally {
      setLoading(false);
    }
  };

  const { timeframe, activity_summary: act, injury_summary: inj, clinical_verdict: verdict } = recap;
  const isCaution = verdict.status === "CAUTION";
  const isSuspended = verdict.status === "SUSPENDED";

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Header Toolbar: Identitas Halaman & Navigasi Siklus Mingguan */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-primary)]">
                  REKAP MINGGUAN AKTIVITAS &amp; CIDERA
                </h1>
                <span className="text-[9.5px] px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold uppercase tracking-wider">
                  Siklus Telemetri 7 Hari
                </span>
              </div>
              <span className="text-[11px] text-[var(--color-text-secondary)] block">
                {timeframe.label} • {act.active_days_count} Hari Aktif / {act.rest_days_count} Hari Pemulihan
              </span>
            </div>
          </div>
        </div>

        {/* Kontrol Navigasi Minggu */}
        <div className="flex items-center gap-1.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg p-1 text-xs shrink-0">
          <button
            onClick={() => fetchWeekRecap(currentOffsetDays - 7)}
            disabled={loading}
            className="px-2.5 py-1.5 hover:bg-[var(--color-surface-card)] rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 font-bold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Minggu Lalu</span>
          </button>
          <button
            onClick={() => fetchWeekRecap(0)}
            disabled={loading || currentOffsetDays === 0}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-bold ${
              currentOffsetDays === 0
                ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] shadow-xs border border-[var(--color-border)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => fetchWeekRecap(currentOffsetDays + 7)}
            disabled={loading}
            className="px-2.5 py-1.5 hover:bg-[var(--color-surface-card)] rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 font-bold"
          >
            <span className="hidden sm:inline">Minggu Depan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Empat Kartu Metrik Utama (Hero Workload & Clinical Indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
            <span>Total Jarak</span>
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

      {/* 3. Banner Protokol Keselamatan Sendi & Korelasi Klinis */}
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

      {/* 4. Rincian Dua Kolom: Timeline 7 Hari (Kiri) vs Status Cidera & Preskripsi (Kanan) */}
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
          />
        </div>
      </div>
    </div>
  );
}
