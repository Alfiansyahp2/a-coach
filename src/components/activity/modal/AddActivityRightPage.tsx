"use client";

import React from "react";
import { PenLine, ArrowRight } from "lucide-react";
import { ScheduledWorkout } from "@/types";
import { ActivityManualFormFields } from "./ActivityManualFormFields";

interface AddActivityRightPageProps {
  defaultWorkout?: ScheduledWorkout | null;
  sportType: string;
  setSportType: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  distanceKm: string;
  setDistanceKm: (v: string) => void;
  durationHours: string;
  setDurationHours: (v: string) => void;
  durationMinutes: string;
  setDurationMinutes: (v: string) => void;
  durationSeconds: string;
  setDurationSeconds: (v: string) => void;
  elevationMeters: string;
  setElevationMeters: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  calculatedSpeedKmh: string;
  calculatedPaceMinKm: string;
  isSubmitting: boolean;
  isParsingImage: boolean;
  onNextStep: () => void;
  onClose: () => void;
}

export function AddActivityRightPage({
  defaultWorkout,
  sportType,
  setSportType,
  name,
  setName,
  startDate,
  setStartDate,
  distanceKm,
  setDistanceKm,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  durationSeconds,
  setDurationSeconds,
  elevationMeters,
  setElevationMeters,
  description,
  setDescription,
  calculatedSpeedKmh,
  calculatedPaceMinKm,
  isSubmitting,
  isParsingImage,
  onNextStep,
  onClose,
}: AddActivityRightPageProps) {
  return (
    <div
      className="flex flex-col relative overflow-y-auto p-5 sm:p-6 transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-book-page-right)",
        backgroundImage: `
          linear-gradient(to right, var(--color-book-margin) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-book-line) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 28px",
        backgroundPosition: "38px 0, 0 8px",
      }}
    >
      {/* Nomor Halaman Kanan & Target Sesi */}
      <div
        className="flex items-center justify-between pb-3 mb-4 border-b text-xs font-mono text-[var(--color-text-secondary)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="flex items-center gap-1.5 text-[var(--color-running)] font-bold">
          <PenLine className="w-3.5 h-3.5" />
          HALAMAN 13 • FORMULIR DATA LATIHAN
        </span>
        {defaultWorkout ? (
          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-[var(--color-cycling)] font-bold">
            Target: {defaultWorkout.workout_category}
          </span>
        ) : (
          <span className="text-[10px] text-[var(--color-text-muted)]">Sesi Bebas Mandiri</span>
        )}
      </div>

      {/* Header Halaman Kanan */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold font-mono text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
          <span>PARAMETER &amp; METRIK SESI</span>
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-0.5">
          Lengkapi nama sesi, waktu pelaksanaan, jarak tempuh, durasi, serta catatan lapangan.
        </p>
      </div>

      {/* Form Isian Input Manual */}
      <div className="space-y-4 mb-4">
        <ActivityManualFormFields
          sportType={sportType}
          setSportType={setSportType}
          name={name}
          setName={setName}
          startDate={startDate}
          setStartDate={setStartDate}
          distanceKm={distanceKm}
          setDistanceKm={setDistanceKm}
          durationHours={durationHours}
          setDurationHours={setDurationHours}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          durationSeconds={durationSeconds}
          setDurationSeconds={setDurationSeconds}
          elevationMeters={elevationMeters}
          setElevationMeters={setElevationMeters}
          description={description}
          setDescription={setDescription}
          calculatedSpeedKmh={calculatedSpeedKmh}
          calculatedPaceMinKm={calculatedPaceMinKm}
        />
      </div>

      {/* Footer Halaman Kanan */}
      <div
        className="mt-auto pt-4 border-t-2 flex items-center justify-between font-mono"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting || isParsingImage}
          className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors cursor-pointer"
        >
          Batal / Tutup Lembaran
        </button>

        <button
          type="button"
          onClick={onNextStep}
          disabled={isSubmitting || isParsingImage}
          className="px-5 py-2.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <span>LANJUT KE CHECK-IN &amp; EVALUASI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

