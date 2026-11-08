"use client";

import React from "react";
import {
  X,
  Calendar,
  HeartPulse,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Flame,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { WeeklyActivityAndInjuryRecap } from "@/lib/domain/analytics/weeklyRecapTypes";
import { formatAnatomyLabel } from "@/lib/domain/analytics/weeklyRecapInjury";

interface WeeklyRecapDetailModalProps {
  recap: WeeklyActivityAndInjuryRecap;
  onClose: () => void;
}

export function WeeklyRecapDetailModal({ recap, onClose }: WeeklyRecapDetailModalProps) {
  const { timeframe, activity_summary: act, injury_summary: inj, clinical_verdict: verdict } = recap;

  const isSuspended = verdict.status === "SUSPENDED";
  const isCaution = verdict.status === "CAUTION";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-mono text-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-cycling)]">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                DOSSIER TELEMETRI MINGGUAN
              </h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">{timeframe.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Banner Status Klinis */}
          <div
            className={`p-3 rounded-lg border text-[11px] space-y-1.5 ${
              isSuspended
                ? "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/30 text-[var(--color-alert-red)]"
                : isCaution
                ? "bg-[var(--color-alert-amber)]/10 border-[var(--color-alert-amber)]/30 text-[var(--color-alert-amber)]"
                : "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30 text-[var(--color-cycling)]"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
              {isSuspended ? (
                <AlertTriangle className="w-4 h-4" />
              ) : isCaution ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{verdict.joint_safety_status}</span>
            </div>
            <p className="text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
              {verdict.load_vs_injury_correlation}
            </p>
          </div>

          {/* Section 1: Ringkasan Aktivitas Harian (Timeline 7 Hari) */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              <span>Distribusi Sesi Harian (Senin – Minggu)</span>
            </h4>
            <div className="space-y-1">
              {act.daily_breakdown.map((d) => (
                <div
                  key={d.date}
                  className={`p-2 rounded border flex items-center justify-between text-[10px] ${
                    d.session_count > 0
                      ? "bg-[var(--color-surface-muted)]/60 border-[var(--color-border)]"
                      : "bg-transparent border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold">{d.day_name}</span>
                    <span className="text-[9px] text-[var(--color-text-muted)] font-tabular">{d.date}</span>
                  </div>
                  {d.session_count > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-text-primary)] font-bold font-tabular">
                        {d.total_distance_km} km
                      </span>
                      <span className="text-[var(--color-text-secondary)] font-tabular">
                        {d.formatted_duration}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-cycling)] font-bold">
                        {d.session_count} sesi
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-[var(--color-text-muted)] italic">Istirahat</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Status Cidera yang Diperoleh & Dimonitor */}
          <div className="space-y-2 pt-1 border-t border-[var(--color-border-subtle)]">
            <h4 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-[var(--color-alert-amber)]" />
              <span>Cidera yang Diperoleh &amp; Dimonitor</span>
            </h4>

            {inj.new_injuries.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-[10px] text-[var(--color-alert-red)] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Insiden Cidera Baru yang Dilaporkan Minggu Ini:</span>
                </div>
                {inj.new_injuries.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded bg-[var(--color-alert-red)]/10 border border-[var(--color-alert-red)]/30 text-[10px] space-y-1 text-[var(--color-text-primary)]"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{formatAnatomyLabel(n.side, n.body_region)} ({n.initial_severity})</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-surface-card)] text-[var(--color-alert-red)]">
                        {n.current_status}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-[var(--color-text-secondary)]">Mekanisme: {n.injury_mechanism}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 rounded bg-[var(--color-surface-muted)]/40 border border-[var(--color-border-subtle)] text-[10px] text-[var(--color-cycling)] flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nol insiden cidera baru yang diperoleh pada minggu ini.</span>
              </div>
            )}

            {/* Cidera Aktif Berjalan */}
            <div className="p-2.5 rounded bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] space-y-1.5">
              <div className="text-[9.5px] font-bold text-[var(--color-text-secondary)] uppercase">
                Daftar Pengawasan Klinis Berkelanjutan:
              </div>
              <div className="space-y-1">
                {inj.active_monitored_injuries.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--color-text-primary)] font-bold">
                      {formatAnatomyLabel(a.side, a.body_region)}
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                      {a.medical_evaluation_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Rekomendasi Preskriptif Coach */}
          <div className="space-y-2 pt-1 border-t border-[var(--color-border-subtle)]">
            <h4 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Instruksi Preskripsi Minggu Depan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-[var(--color-surface-muted)]/40 border border-[var(--color-border-subtle)]">
                <div className="font-bold text-[var(--color-running)] uppercase mb-0.5">Cabang Lari</div>
                <div className="text-[var(--color-text-secondary)]">{verdict.running_guidance}</div>
              </div>
              <div className="p-2 rounded bg-[var(--color-surface-muted)]/40 border border-[var(--color-border-subtle)]">
                <div className="font-bold text-[var(--color-cycling)] uppercase mb-0.5">Cabang Sepeda</div>
                <div className="text-[var(--color-text-secondary)]">{verdict.cycling_guidance}</div>
              </div>
            </div>
            <ul className="space-y-1 text-[10px] text-[var(--color-text-secondary)] pl-3 list-disc">
              {verdict.actionable_recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-[10.5px] transition-colors cursor-pointer"
          >
            Tutup Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

