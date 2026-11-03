"use client";

import React from "react";
import { ScheduledWorkout, WorkoutActivityMatch } from "@/types";
import { X, Gauge, ShieldAlert } from "lucide-react";
import { formatDistance, formatDuration, formatDate, formatDateOnly } from "@/lib/formatters";
import { AddActivityModal } from "@/components/AddActivityModal";

export interface WorkoutDossierModalProps {
  workout: ScheduledWorkout;
  match: WorkoutActivityMatch | null;
  onClose: () => void;
  isRunningCategory: (category: string) => boolean;
}

export function WorkoutDossierModal({
  workout,
  match,
  onClose,
  isRunningCategory,
}: WorkoutDossierModalProps) {
  const isRun = isRunningCategory(workout.workout_category);
  const isCycling = workout.workout_category === "Cycling";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#12151D] border border-[#2D3547] rounded-sm p-5 space-y-4 font-mono shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-none ${
                isRun
                  ? "bg-[#D4FF00]"
                  : isCycling
                  ? "bg-[#00F0FF]"
                  : "bg-[#FF9500]"
              }`}
            />
            <h3 className="text-sm font-bold text-[#F0F2F5] uppercase">
              Dossier Sesi: {workout.workout_category}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center text-[#9BA3AF] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Prescribed Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Tanggal Jadwal</span>
            <span className="text-xs font-bold text-[#F0F2F5]">{formatDate(workout.scheduled_date)}</span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Target Durasi</span>
            <span className="text-xs font-bold text-[#D4FF00]">
              {workout.target_duration_seconds
                ? formatDuration(workout.target_duration_seconds)
                : "--"}
            </span>
          </div>
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[9px] text-[#5A6272] block uppercase">Estimasi Jarak</span>
            <span className="text-xs font-bold text-[#00F0FF]">
              {workout.target_distance_meters
                ? formatDistance(workout.target_distance_meters)
                : "--"}
            </span>
          </div>
        </div>

        {/* Intensity & Directives */}
        <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5 text-xs">
          <span className="text-[10px] text-[#5A6272] uppercase block">Target Intensitas & Talk Test</span>
          <p className="text-[#00F0FF] font-semibold">{workout.target_intensity || "Zone 2 • RPE 3–4/10"}</p>
          <p className="text-[11px] text-[#9BA3AF] leading-relaxed pt-1">
            {workout.description}
          </p>
        </div>

        {/* Talk Test & Pacing Instructions */}
        <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#00F0FF]/30 space-y-1 text-[10px] text-[#9BA3AF]">
          <span className="font-bold text-[#00F0FF] flex items-center gap-1.5">
            <Gauge className="w-3 h-3 text-[#00F0FF]" />
            Pedoman Pacing Zone 2 (Tanpa Heart-Rate Monitor)
          </span>
          <p className="leading-snug">
            Pertahankan ritme di mana Anda masih bisa berbicara dalam kalimat lengkap tanpa terputus. Jika napas mulai berat, segera pindahkan gigi ke rasio yang lebih ringan.
          </p>
        </div>

        {/* Safety & Joint Alignment Notice */}
        <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#FF2A6D]/30 flex items-start gap-2 text-[10px] text-[#9BA3AF]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#FF2A6D] shrink-0 mt-0.5" />
          <span>
            <strong>Instruksi Keamanan Sendi:</strong>{" "}
            {isRun
              ? "Sesi lari bertahap (Walk/Jog). Gunakan permukaan datar halus atau treadmill. Hentikan seketika jika timbul nyeri tajam pada pergelangan kaki kanan atau tempurung lutut bilateral."
              : "Beban putaran tertutup tanpa hentakan. Gunakan gigi ringan pada jalur datar. Hindari tanjakan bertorsi tinggi untuk mencegah kompresi berlebih pada lutut."}
          </span>
        </div>

        {/* If matched with real Strava session */}
        {match && (
          <div className="p-2.5 rounded-sm bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Terverifikasi Sesi Strava Nyata:</span>
              <span>{match.completion_percentage}% Selesai</span>
            </div>
            <p className="text-[10px] text-[#9BA3AF]">
              Sesi tuntas tercatat di database dengan kepatuhan penuh terhadap target.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1F2430]">
          <AddActivityModal
            variant="outline"
            defaultWorkout={workout}
            defaultDate={formatDateOnly(workout.scheduled_date)}
            onSuccess={onClose}
          />
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#D4FF00] text-xs font-semibold text-[#F0F2F5] transition-colors"
          >
            Tutup Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

