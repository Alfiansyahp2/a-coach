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
  ArrowUpRight,
  HeartPulse,
  Mountain,
} from "lucide-react";
import { WeeklyActivityAndInjuryRecap } from "@/lib/domain/analytics/weeklyRecapTypes";
import { WeeklyRecapDetailModal } from "./WeeklyRecapDetailModal";

interface WeeklyRecapCardProps {
  initialRecap?: WeeklyActivityAndInjuryRecap;
  userId?: string;
}

export function WeeklyRecapCard({ initialRecap }: WeeklyRecapCardProps) {
  const [recap, setRecap] = useState<WeeklyActivityAndInjuryRecap | undefined>(initialRecap);
  const [loading, setLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  if (!recap) {
    return (
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] text-center text-xs text-[var(--color-text-muted)] font-mono">
        Memuat rekap telemetri mingguan...
      </div>
    );
  }

  const { timeframe, activity_summary: act, injury_summary: inj, clinical_verdict: verdict } = recap;
  const isCaution = verdict.status === "CAUTION";
  const isSuspended = verdict.status === "SUSPENDED";

  return (
    <>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-3.5 sm:p-4 text-xs font-mono space-y-3.5 shadow-xs">
        {/* 1. Header: Judul, Sesi, Periode & Navigasi Minggu */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-border-subtle)]">
              <ActivityIcon className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                  REKAP TELEMETRI MINGGUAN
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  {act.total_sessions} Sesi
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {timeframe.label} • {act.active_days_count} Hari Aktif / {act.rest_days_count} Istirahat
              </p>
            </div>
          </div>

          {/* Navigasi Minggu */}
          <div className="flex items-center gap-1 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg p-0.5 text-[10px] shrink-0">
            <button
              onClick={() => fetchWeekRecap(currentOffsetDays - 7)}
              disabled={loading}
              className="p-1 hover:bg-[var(--color-surface-card)] rounded text-[var(--color-text-secondary)] cursor-pointer disabled:opacity-50"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => fetchWeekRecap(0)}
              disabled={loading || currentOffsetDays === 0}
              className={`px-2 py-0.5 rounded cursor-pointer ${currentOffsetDays === 0 ? "bg-[var(--color-surface-card)] text-[var(--color-cycling)] font-bold shadow-2xs" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => fetchWeekRecap(currentOffsetDays + 7)}
              disabled={loading}
              className="p-1 hover:bg-[var(--color-surface-card)] rounded text-[var(--color-text-secondary)] cursor-pointer disabled:opacity-50"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Beban Kerja Fisik (Workload Telemetry) */}
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

          {/* Rincian Cabang Olahraga */}
          <div className="space-y-1">
            {act.sport_breakdown.map((s) => {
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

        {/* 3. Status Sendi, Nyeri & Pemulihan (Joint & Pain Telemetry) */}
        <div className="space-y-2 pt-1 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-[var(--color-alert-amber)] shrink-0" />
              <span>Status Sendi &amp; Nyeri</span>
            </span>
            <span
              className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase ${
                inj.new_injuries_count > 0
                  ? "bg-[var(--color-alert-red)]/15 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30"
                  : "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30"
              }`}
            >
              {inj.new_injuries_count > 0 ? `${inj.new_injuries_count} Cidera Baru` : "0 Cidera Baru"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border-subtle)]">
              <div className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] font-tabular">
                {inj.pain_telemetry.average_pain_score} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">/10</span>
              </div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Rata Nyeri</div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border-subtle)]">
              <div
                className={`text-base sm:text-lg font-bold font-tabular ${
                  inj.pain_telemetry.peak_pain_score >= 4
                    ? "text-[var(--color-alert-amber)]"
                    : "text-[var(--color-text-primary)]"
                }`}
              >
                {inj.pain_telemetry.peak_pain_score} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">/10</span>
              </div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Puncak Nyeri</div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--color-surface-muted)]/60 border border-[var(--color-border-subtle)]">
              <div className="text-base sm:text-lg font-bold text-[var(--color-cycling)] font-tabular">
                {inj.training_responses_summary.pain_free_sessions_count}
              </div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">Sesi Bebas Nyeri</div>
            </div>
          </div>

          {/* Area yang Dimonitor */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] pt-0.5">
            <span className="text-[var(--color-text-secondary)] font-semibold shrink-0">Area Pengawasan:</span>
            {inj.affected_anatomical_regions.length > 0 ? (
              inj.affected_anatomical_regions.map((reg) => (
                <span
                  key={reg}
                  className="px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-[9.5px]"
                >
                  {reg}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-[var(--color-text-muted)] italic">Tidak ada area cidera aktif</span>
            )}
          </div>
        </div>

        {/* 4. Keputusan Klinis & Keselamatan Sendi Banner */}
        <div
          className={`p-3 rounded-lg border text-[11px] flex items-start justify-between gap-3 ${
            isSuspended
              ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/30"
              : isCaution
              ? "bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)]/30"
              : "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isSuspended ? (
              <AlertTriangle className="w-4 h-4 text-[var(--color-alert-red)] shrink-0 mt-0.5" />
            ) : isCaution ? (
              <ShieldAlert className="w-4 h-4 text-[var(--color-alert-amber)] shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[var(--color-cycling)] shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div
                className={`font-bold text-[11px] ${
                  isSuspended
                    ? "text-[var(--color-alert-red)]"
                    : isCaution
                    ? "text-[var(--color-alert-amber)]"
                    : "text-[var(--color-cycling)]"
                }`}
              >
                {verdict.joint_safety_status}
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
                {verdict.load_vs_injury_correlation}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsDetailOpen(true)}
            className="px-2.5 py-1 rounded bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-[10px] transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>Rincian</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--color-cycling)]" />
          </button>
        </div>
      </div>

      {/* Modal Detail Rekap Mingguan */}
      {isDetailOpen && (
        <WeeklyRecapDetailModal recap={recap} onClose={() => setIsDetailOpen(false)} />
      )}
    </>
  );
}
