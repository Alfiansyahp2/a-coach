"use client";

import React from "react";
import {
  Bookmark,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ActivityImageUploader } from "./ActivityImageUploader";

interface AddActivityLeftPageProps {
  errorMsg: string | null;
  successMsg: string | null;
  startDate: string;
  imagePreview: string | null;
  setImagePreview: (val: string | null) => void;
  isParsingImage: boolean;
  setIsParsingImage: (val: boolean) => void;
  ocrSuccessMsg: string | null;
  setOcrSuccessMsg: (val: string | null) => void;
  ocrRawText: string | null;
  setOcrRawText: (val: string | null) => void;
  setErrorMsg: (val: string | null) => void;
  handleTelemetryExtracted: (tel: any) => void;
  numericDistanceKm: number;
  totalDurationSeconds: number;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
  calculatedSpeedKmh: string;
  calculatedPaceMinKm: string;
}

export function AddActivityLeftPage({
  errorMsg,
  successMsg,
  startDate,
  imagePreview,
  setImagePreview,
  isParsingImage,
  setIsParsingImage,
  ocrSuccessMsg,
  setOcrSuccessMsg,
  ocrRawText,
  setOcrRawText,
  setErrorMsg,
  handleTelemetryExtracted,
  numericDistanceKm,
  totalDurationSeconds,
  durationHours,
  durationMinutes,
  durationSeconds,
  calculatedSpeedKmh,
  calculatedPaceMinKm,
}: AddActivityLeftPageProps) {
  return (
    <div
      className="flex flex-col border-b lg:border-b-0 lg:border-r relative overflow-y-auto p-5 sm:p-6 transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-book-page-left)",
        borderColor: "var(--color-border)",
        backgroundImage: `
          linear-gradient(to right, var(--color-book-margin) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-book-line) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 28px",
        backgroundPosition: "38px 0, 0 8px",
      }}
    >
      {/* Nomor Halaman Kiri & Tanggal */}
      <div
        className="flex items-center justify-between pb-3 mb-4 border-b text-xs font-mono text-[var(--color-text-secondary)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="flex items-center gap-1.5 text-[var(--color-cycling)] font-bold">
          <Bookmark className="w-3.5 h-3.5" />
          HALAMAN 12 • LOG TELEMETRI
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
          <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
          {new Date(startDate || Date.now()).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Header Halaman Kiri */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold font-mono text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-cycling)]" />
          BUKTI FISIK &amp; KINEMATIKA SESI
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-0.5">
          Rekatkan tangkapan layar Strava/Garmin untuk pembacaan OCR otomatis.
        </p>
      </div>

      {/* Error & Success Notice di Halaman Kiri */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-alert-red)]/15 border border-[var(--color-alert-red)]/40 flex items-start gap-2.5 text-xs text-[var(--color-alert-red)] font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Koreksi: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 flex items-start gap-2.5 text-xs text-[var(--color-cycling)] font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Tercatat: </span>
            {successMsg}
          </div>
        </div>
      )}

      {/* Uploader Gambar Telemetri (OCR) */}
      <div className="mb-4">
        <ActivityImageUploader
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          isParsingImage={isParsingImage}
          setIsParsingImage={setIsParsingImage}
          ocrSuccessMsg={ocrSuccessMsg}
          setOcrSuccessMsg={setOcrSuccessMsg}
          ocrRawText={ocrRawText}
          setOcrRawText={setOcrRawText}
          setErrorMsg={setErrorMsg}
          onTelemetryExtracted={handleTelemetryExtracted}
        />
      </div>

      {/* Box Kinematika Buku (Jarak, Durasi, Elevasi) */}
      <div
        className="mt-auto pt-3 border-t space-y-3 font-mono text-xs"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
          <span className="font-bold text-[var(--color-cycling)]">RINGKASAN METRIK TERTULIS</span>
          <span>Halaman Kiri</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
            <span className="text-[10px] text-[var(--color-text-muted)] block">Jarak Terbaca</span>
            <span className="text-sm font-bold text-[var(--color-cycling)] font-tabular">
              {numericDistanceKm > 0 ? `${numericDistanceKm.toFixed(2)} km` : "-"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
            <span className="text-[10px] text-[var(--color-text-muted)] block">Total Durasi</span>
            <span className="text-sm font-bold text-[var(--color-text-primary)] font-tabular">
              {totalDurationSeconds > 0
                ? `${durationHours}j ${durationMinutes}m ${durationSeconds}d`
                : "-"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
            <span className="text-[10px] text-[var(--color-text-muted)] block">Rata-rata Speed</span>
            <span className="text-sm font-bold text-[var(--color-cycling)] font-tabular">
              {calculatedSpeedKmh} km/jam
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-xs">
            <span className="text-[10px] text-[var(--color-text-muted)] block">Pace Hitungan</span>
            <span className="text-sm font-bold text-[var(--color-running)] font-tabular">
              {calculatedPaceMinKm} /km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

