"use client";

import React from "react";
import { AthleteTrainingResponse } from "@/types";
import { Activity as ActivityIcon } from "lucide-react";

interface TrainingResponsesTabProps {
  recentResponses: AthleteTrainingResponse[];
}

export function TrainingResponsesTab({ recentResponses }: TrainingResponsesTabProps) {
  return (
    <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
        <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
          <ActivityIcon className="w-3.5 h-3.5 text-[#10B981]" />
          Korelasi Respons Gejala Terhadap Sesi Nyata Strava
        </span>
        <span className="text-[#5A6272]">Validasi Toleransi Beban</span>
      </div>

      <div className="space-y-2.5">
        {recentResponses.map((res) => (
          <div
            key={res.id}
            className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-2 text-xs"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#F0F2F5]">
                  {res.sport_type} • {res.distance_km} km
                </span>
                <span className="text-[10px] text-[#5A6272]">
                  ({Math.round(res.duration_seconds / 60)} menit durasi)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  Nyeri: {res.pain_during_activity ?? 0}/10
                </span>
                <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  RPE: {res.rpe_score || 6.0}/10
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#9BA3AF] leading-relaxed">
              {res.athlete_comments}
            </p>

            <div className="flex items-center justify-between text-[10px] text-[#5A6272] pt-1 border-t border-[#1F2430]/40">
              <span>Bengkak: {res.swelling_observed ? "Terdeteksi ⚠️" : "Nihil ✅"}</span>
              <span>Instabilitas: {res.instability_observed ? "Terdeteksi ⚠️" : "Stabil ✅"}</span>
              <span>Kelelahan: {res.fatigue_response}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

