"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ScheduledWorkout } from "@/types";
import {
  X,
  BookOpen,
  Check,
  RefreshCw,
  PenLine,
} from "lucide-react";
import { ActivityManualFormFields } from "./ActivityManualFormFields";
import { ActivityHealthCheckinFields } from "./ActivityHealthCheckinFields";
import { useAddActivityForm } from "./useAddActivityForm";
import { AddActivityLeftPage } from "./AddActivityLeftPage";

interface AddActivityModalProps {
  variant?: "button" | "outline" | "compact";
  defaultSportType?: string;
  defaultDate?: string;
  defaultWorkout?: ScheduledWorkout | null;
  onSuccess?: () => void;
}

export function AddActivityModal({
  variant = "button",
  defaultSportType = "Ride",
  defaultDate,
  defaultWorkout = null,
  onSuccess,
}: AddActivityModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useAddActivityForm({
    defaultSportType,
    defaultDate,
    defaultWorkout,
    onSuccess,
  });

  const modalDialog = form.isOpen ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar Floating Controls */}
      <div className="absolute top-3 right-4 sm:right-6 z-[100000] flex items-center gap-2">
        <button
          onClick={form.handleClose}
          disabled={form.isSubmitting || form.isParsingImage}
          className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] font-mono text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Tutup Buku</span>
        </button>
      </div>

      {/* THE OPEN BOOK CONTAINER */}
      <div
        className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl p-2.5 sm:p-4 shadow-2xl relative overflow-hidden transition-colors duration-200"
        style={{
          backgroundColor: "var(--color-book-cover)",
          borderColor: "var(--color-book-cover-border)",
          borderWidth: "1px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ribbon bookmark */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-8 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-800 rounded-b-md shadow-md z-30 flex items-end justify-center pb-1 pointer-events-none">
          <div className="w-3 h-1 bg-amber-300 dark:bg-amber-400/60 rounded-full" />
        </div>

        {/* Form Container */}
        <form onSubmit={form.handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div
            className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-xl overflow-hidden relative shadow-inner"
            style={{
              borderColor: "var(--color-border)",
              borderWidth: "1px",
            }}
          >
            {/* 📖 HALAMAN KIRI (LEFT PAGE): Telemetri, Foto OCR & Kinematika */}
            <AddActivityLeftPage
              errorMsg={form.errorMsg}
              successMsg={form.successMsg}
              startDate={form.startDate}
              imagePreview={form.imagePreview}
              setImagePreview={form.setImagePreview}
              isParsingImage={form.isParsingImage}
              setIsParsingImage={form.setIsParsingImage}
              ocrSuccessMsg={form.ocrSuccessMsg}
              setOcrSuccessMsg={form.setOcrSuccessMsg}
              ocrRawText={form.ocrRawText}
              setOcrRawText={form.setOcrRawText}
              setErrorMsg={form.setErrorMsg}
              handleTelemetryExtracted={form.handleTelemetryExtracted}
              numericDistanceKm={form.numericDistanceKm}
              totalDurationSeconds={form.totalDurationSeconds}
              durationHours={form.durationHours}
              durationMinutes={form.durationMinutes}
              durationSeconds={form.durationSeconds}
              calculatedSpeedKmh={form.calculatedSpeedKmh}
              calculatedPaceMinKm={form.calculatedPaceMinKm}
            />

            {/* 📖 HALAMAN KANAN (RIGHT PAGE): Formulir Manual & Audit Klinis */}
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
                  HALAMAN 13 • FORMULIR &amp; AUDIT SENDI
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
                  <span>PARAMETER &amp; EVALUASI KESEHATAN</span>
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-0.5">
                  Lengkapi nama sesi, intensitas RPE Borg CR10, serta kontrol nyeri sendi.
                </p>
              </div>

              {/* Form Isian Input Manual */}
              <div className="space-y-4 mb-4">
                <ActivityManualFormFields
                  sportType={form.sportType}
                  setSportType={form.setSportType}
                  name={form.name}
                  setName={form.setName}
                  startDate={form.startDate}
                  setStartDate={form.setStartDate}
                  distanceKm={form.distanceKm}
                  setDistanceKm={form.setDistanceKm}
                  durationHours={form.durationHours}
                  setDurationHours={form.setDurationHours}
                  durationMinutes={form.durationMinutes}
                  setDurationMinutes={form.setDurationMinutes}
                  durationSeconds={form.durationSeconds}
                  setDurationSeconds={form.setDurationSeconds}
                  elevationMeters={form.elevationMeters}
                  setElevationMeters={form.setElevationMeters}
                  description={form.description}
                  setDescription={form.setDescription}
                  calculatedSpeedKmh={form.calculatedSpeedKmh}
                  calculatedPaceMinKm={form.calculatedPaceMinKm}
                />

                {/* Audit Medis Sendi & RPE */}
                <ActivityHealthCheckinFields
                  rpeScore={form.rpeScore}
                  setRpeScore={form.setRpeScore}
                  painScale={form.painScale}
                  setPainScale={form.setPainScale}
                  swellingObserved={form.swellingObserved}
                  setSwellingObserved={form.setSwellingObserved}
                  instabilityObserved={form.instabilityObserved}
                  setInstabilityObserved={form.setInstabilityObserved}
                />
              </div>

              {/* Footer Halaman Kanan */}
              <div
                className="mt-auto pt-4 border-t-2 flex items-center justify-between font-mono"
                style={{ borderColor: "var(--color-border)" }}
              >
                <button
                  type="button"
                  onClick={form.handleClose}
                  disabled={form.isSubmitting || form.isParsingImage}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors cursor-pointer"
                >
                  Batal / Tutup Lembaran
                </button>

                <button
                  type="submit"
                  disabled={form.isSubmitting || form.isParsingImage}
                  className="px-6 py-2.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {form.isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>MENULIS KE JURNAL...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>TULIS KE BUKU JURNAL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Garis Lipatan Tengah Buku */}
            <div
              className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20 border-x"
              style={{
                background: `linear-gradient(to right, var(--color-book-crease-start), var(--color-book-crease-mid), var(--color-book-crease-start))`,
                borderColor: "var(--color-border)",
              }}
            />
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Trigger Buttons */}
      {variant === "button" && (
        <button
          onClick={form.handleOpen}
          className="px-3.5 py-1.5 rounded-md bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-semibold font-mono tracking-tight transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <BookOpen className="w-4 h-4 stroke-[2.2]" />
          <span>+ TAMBAH AKTIVITAS</span>
        </button>
      )}

      {variant === "outline" && (
        <button
          onClick={form.handleOpen}
          className="px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Buka Buku Jurnal</span>
        </button>
      )}

      {variant === "compact" && (
        <button
          onClick={form.handleOpen}
          className="p-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] transition-colors shadow-xs cursor-pointer"
          title="Buka Buku Catatan Aktivitas"
        >
          <BookOpen className="w-4 h-4 text-[var(--color-cycling)]" />
        </button>
      )}

      {mounted && typeof document !== "undefined" && modalDialog
        ? createPortal(modalDialog, document.body)
        : modalDialog}
    </>
  );
}
