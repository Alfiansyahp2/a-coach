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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4 font-mono shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRun
                  ? "bg-[var(--color-running)]"
                  : isCycling
                  ? "bg-[var(--color-cycling)]"
                  : "bg-[var(--color-alert-amber)]"
              }`}
            />
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase">
              Dossier Sesi: {workout.workout_category}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prescribed Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <span className="text-[9px] text-[var(--color-text-muted)] block uppercase font-semibold">Tanggal Jadwal</span>
            <span className="text-xs font-bold text-[var(--color-text-primary)] font-tabular">{formatDate(workout.scheduled_date)}</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <span className="text-[9px] text-[var(--color-text-muted)] block uppercase font-semibold">Target Durasi</span>
            <span className="text-xs font-bold text-[var(--color-cycling)] font-tabular">
              {workout.target_duration_seconds
                ? formatDuration(workout.target_duration_seconds)
                : "--"}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <span className="text-[9px] text-[var(--color-text-muted)] block uppercase font-semibold">Estimasi Jarak</span>
            <span className="text-xs font-bold text-[var(--color-text-primary)] font-tabular">
              {workout.target_distance_meters
                ? formatDistance(workout.target_distance_meters)
                : "--"}
            </span>
          </div>
        </div>

        {/* Intensity & Directives */}
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5 text-xs">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase block font-semibold">Target Intensitas &amp; Talk Test</span>
          <p className="text-[var(--color-cycling)] font-semibold">{workout.target_intensity || "Zone 2 • RPE 3–4/10"}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed pt-1">
            {workout.description}
          </p>
        </div>

        {/* Talk Test & Pacing Instructions */}
        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-cycling)]/30 space-y-1 text-[10px] text-[var(--color-text-secondary)]">
          <span className="font-bold text-[var(--color-cycling)] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            Pedoman Pacing Zone 2 (Tanpa Heart-Rate Monitor)
          </span>
          <p className="leading-snug">
            Pertahankan ritme di mana Anda masih bisa berbicara dalam kalimat lengkap tanpa terputus. Jika napas mulai berat, segera pindahkan gigi ke rasio yang lebih ringan.
          </p>
        </div>

        {/* Safety & Joint Alignment Notice */}
        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-alert-red)]/30 flex items-start gap-2 text-[10px] text-[var(--color-text-secondary)]">
          <ShieldAlert className="w-3.5 h-3.5 text-[var(--color-alert-red)] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[var(--color-text-primary)]">Instruksi Keamanan Sendi:</strong>{" "}
            {isRun
              ? "Sesi lari bertahap (Walk/Jog). Gunakan permukaan datar halus atau treadmill. Hentikan seketika jika timbul nyeri tajam pada pergelangan kaki kanan atau tempurung lutut bilateral."
              : "Beban putaran tertutup tanpa hentakan. Gunakan gigi ringan pada jalur datar. Hindari tanjakan bertorsi tinggi untuk mencegah kompresi berlebih pada lutut."}
          </span>
        </div>

        {/* If matched with real Strava session */}
        {match && (
          <div className="p-3 rounded-lg bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 text-xs text-[var(--color-cycling)] space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Terverifikasi Sesi Strava Nyata:</span>
              <span className="font-tabular">{match.completion_percentage}% Selesai</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">
              Sesi tuntas tercatat di database dengan kepatuhan penuh terhadap target.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <AddActivityModal
            variant="outline"
            defaultWorkout={workout}
            defaultDate={formatDateOnly(workout.scheduled_date)}
            onSuccess={onClose}
          />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-text-primary)] text-xs font-semibold text-[var(--color-text-primary)] transition-colors"
          >
            Tutup Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
