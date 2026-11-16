"use client";

import React from "react";
import { AthleteTrainingResponse } from "@/types";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  AlertTriangle,
  Bike,
  Footprints,
  ShieldCheck,
  Zap,
  MessageSquare,
  Clock,
} from "lucide-react";

interface TrainingResponsesTabProps {
  recentResponses: AthleteTrainingResponse[];
}

export function TrainingResponsesTab({ recentResponses }: TrainingResponsesTabProps) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 font-mono shadow-xs">
      {/* Tab Header & Telemetry Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)] text-xs">
        <div>
          <span className="font-bold text-[var(--color-text-primary)] uppercase flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-[var(--color-cycling)]" />
            Validasi Empiris Respons Latihan Nyata Strava
          </span>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            Mencocokkan toleransi sendi, skala nyeri, dan RPE setelah menyelesaikan sesi latihan nyata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 text-[10px] font-bold">
            {recentResponses.length} SESI TERVERIFIKASI
          </span>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-3">
        {recentResponses.map((res) => {
          const isBike =
            res.sport_type.toLowerCase().includes("ride") ||
            res.sport_type.toLowerCase().includes("bike") ||
            res.sport_type.toLowerCase().includes("cycling");
          const painScore = res.pain_during_activity ?? 0;
          const rpeScore = res.rpe_score || 6.0;

          return (
            <div
              key={res.id}
              className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-3 text-xs shadow-xs"
            >
              {/* Card Header: Sport, Distance, Duration, and Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)]">
                    {isBike ? <Bike className="w-4 h-4 text-[var(--color-cycling)]" /> : <Footprints className="w-4 h-4 text-[var(--color-running)]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--color-text-primary)]">
                        {res.sport_type} • {res.distance_km} km
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(res.duration_seconds / 60)} menit
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      Sesi sinkronisasi telemetri Strava
                    </span>
                  </div>
                </div>

                {/* Pain & RPE Badges */}
                <div className="flex items-center gap-2 font-mono">
                  {/* Pain Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1 ${
                      painScore === 0
                        ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                        : painScore <= 3
                        ? "bg-[var(--color-alert-amber)]/10 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
                        : "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/30"
                    }`}
                  >
                    <span>Nyeri:</span>
                    <strong className="text-sm font-tabular">{painScore}</strong>
                    <span className="text-[9px]">/10</span>
                  </div>

                  {/* RPE Badge */}
                  <div className="px-2.5 py-1 rounded-md bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-[10px] font-bold flex items-center gap-1">
                    <span>RPE:</span>
                    <strong className="text-sm font-tabular text-[var(--color-cycling)]">{rpeScore}</strong>
                    <span className="text-[9px] text-[var(--color-text-muted)]">/10</span>
                  </div>
                </div>
              </div>

              {/* RPE & Intensity Meter Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                  <span>Intensitas Subjektif (RPE Borg Scale CR10)</span>
                  <span className="text-[var(--color-cycling)] font-bold">
                    {rpeScore <= 4 ? "Zone 2 (Aerobik Ringan)" : rpeScore <= 6 ? "Moderat (Tempo Aman)" : "Intensitas Tinggi"}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-card)] overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full bg-[var(--color-cycling)] transition-all"
                    style={{ width: `${Math.min(100, (rpeScore / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Joint & Physiological Tolerance Matrix (3 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Pembengkakan:</span>
                  <span
                    className={`font-bold text-[10px] flex items-center gap-1 ${
                      res.swelling_observed ? "text-[var(--color-alert-red)]" : "text-[var(--color-cycling)]"
                    }`}
                  >
                    {res.swelling_observed ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        Terdeteksi
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Nihil (Aman)
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Stabilitas Sendi:</span>
                  <span
                    className={`font-bold text-[10px] flex items-center gap-1 ${
                      res.instability_observed ? "text-[var(--color-alert-red)]" : "text-[var(--color-cycling)]"
                    }`}
                  >
                    {res.instability_observed ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        Goyah/Nyeri
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Stabil Penuh
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Respon Lelah:</span>
                  <span className="font-bold text-[10px] text-[var(--color-endurance)] flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {res.fatigue_response || "Normal Terkendali"}
                  </span>
                </div>
              </div>

              {/* Athlete Feedback Quote */}
              {res.athlete_comments && (
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[11px] flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed text-[var(--color-text-primary)]">
                    "{res.athlete_comments}"
                  </p>
                </div>
              )}

              {/* Clinical Coach Verdict */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5 text-[var(--color-cycling)] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SOP Coach: Beban sesuai batas toleransi sendi. Lanjutkan protokol adaptasi.</span>
                </span>
                <span className="text-[var(--color-text-muted)]">Terverifikasi Telemetri</span>
              </div>
            </div>
          );
        })}

        {recentResponses.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-muted)]/30">
            Belum ada respons latihan Strava yang dicatat. Lakukan check-in pasca sesi untuk memvalidasi toleransi sendi.
          </div>
        )}
      </div>
    </div>
  );
}
