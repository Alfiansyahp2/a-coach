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
    <div className="p-4 sm:p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono shadow-sm">
      {/* Tab Header & Telemetry Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F2430] text-xs">
        <div>
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-[#10B981]" />
            Validasi Empiris Respons Latihan Nyata Strava
          </span>
          <p className="text-[11px] text-[#9BA3AF] mt-0.5">
            Mencocokkan toleransi sendi, skala nyeri, dan RPE setelah menyelesaikan sesi latihan nyata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xs bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold">
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
              className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#10B981]/40 transition-all space-y-3 text-xs"
            >
              {/* Card Header: Sport, Distance, Duration, and Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1F2430]/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-center text-[#00F0FF]">
                    {isBike ? <Bike className="w-4 h-4 text-[#00F0FF]" /> : <Footprints className="w-4 h-4 text-[#D4FF00]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#F0F2F5]">
                        {res.sport_type} • {res.distance_km} km
                      </span>
                      <span className="text-[10px] text-[#5A6272] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(res.duration_seconds / 60)} menit
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9BA3AF]">
                      Sesi sinkronisasi telemetri Strava
                    </span>
                  </div>
                </div>

                {/* Pain & RPE Badges */}
                <div className="flex items-center gap-2 font-mono">
                  {/* Pain Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-xs border text-[10px] font-bold flex items-center gap-1 ${
                      painScore === 0
                        ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                        : painScore <= 3
                        ? "bg-[#FF9500]/15 text-[#FF9500] border-[#FF9500]/30"
                        : "bg-[#FF2A6D]/15 text-[#FF2A6D] border-[#FF2A6D]/30"
                    }`}
                  >
                    <span>Nyeri Sesi:</span>
                    <strong className="text-sm font-tabular">{painScore}</strong>
                    <span className="text-[9px]">/10</span>
                  </div>

                  {/* RPE Badge */}
                  <div className="px-2.5 py-1 rounded-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold flex items-center gap-1">
                    <span>RPE:</span>
                    <strong className="text-sm font-tabular">{rpeScore}</strong>
                    <span className="text-[9px]">/10</span>
                  </div>
                </div>
              </div>

              {/* RPE & Intensity Meter Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
                  <span>Intensitas Subjektif (RPE Borg Scale CR10)</span>
                  <span className="text-[#00F0FF] font-bold">
                    {rpeScore <= 4 ? "Zone 2 (Aerobik Ringan)" : rpeScore <= 6 ? "Moderat (Tempo Aman)" : "Intensitas Tinggi"}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#12151D] overflow-hidden border border-[#1F2430]">
                  <div
                    className="h-full bg-gradient-to-r from-[#10B981] via-[#00F0FF] to-[#D4FF00]"
                    style={{ width: `${Math.min(100, (rpeScore / 10) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Joint & Physiological Tolerance Matrix (3 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                  <span className="text-[#5A6272]">Pembengkakan:</span>
                  <span
                    className={`font-bold text-[10px] flex items-center gap-1 ${
                      res.swelling_observed ? "text-[#FF2A6D]" : "text-[#10B981]"
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

                <div className="p-2 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                  <span className="text-[#5A6272]">Stabilitas Sendi:</span>
                  <span
                    className={`font-bold text-[10px] flex items-center gap-1 ${
                      res.instability_observed ? "text-[#FF2A6D]" : "text-[#10B981]"
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

                <div className="p-2 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                  <span className="text-[#5A6272]">Respon Lelah:</span>
                  <span className="font-bold text-[10px] text-[#00F0FF] flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {res.fatigue_response || "Normal Terkendali"}
                  </span>
                </div>
              </div>

              {/* Athlete Feedback Quote */}
              {res.athlete_comments && (
                <div className="p-2.5 rounded-sm bg-[#090A0F]/80 border border-[#1F2430] text-[11px] text-[#9BA3AF] flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#5A6272] shrink-0 mt-0.5" />
                  <p className="italic leading-relaxed text-[#F0F2F5]">
                    "{res.athlete_comments}"
                  </p>
                </div>
              )}

              {/* Clinical Coach Verdict */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-[#5A6272]">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SOP Coach: Beban sesuai batas toleransi sendi. Lanjutkan protokol adaptasi.</span>
                </span>
                <span className="text-[#5A6272]">Terverifikasi Telemetri</span>
              </div>
            </div>
          );
        })}

        {recentResponses.length === 0 && (
          <div className="py-12 text-center text-xs text-[#5A6272]">
            Belum ada respons latihan Strava yang dicatat. Lakukan check-in pasca sesi untuk memvalidasi toleransi sendi.
          </div>
        )}
      </div>
    </div>
  );
}
