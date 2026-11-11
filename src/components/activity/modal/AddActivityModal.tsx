"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ScheduledWorkout } from "@/types";
import { X, BookOpen, Layers } from "lucide-react";
import { useAddActivityForm } from "./useAddActivityForm";
import { AddActivityLeftPage } from "./AddActivityLeftPage";
import { AddActivityRightPage } from "./AddActivityRightPage";
import { AddActivityCheckinLeftPage } from "./AddActivityCheckinLeftPage";
import { AddActivityInjuryRightPage } from "./AddActivityInjuryRightPage";

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
      {/* Top Floating Controls */}
      <div className="absolute top-3 right-4 sm:right-6 z-[100000] flex items-center gap-2">
        {/* Step Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-secondary)] shadow-lg">
          <Layers className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>
            {form.step === 1 ? "Lembar 1: Log & Formulir (Hal 12-13)" : "Lembar 2: Check-in & Evaluasi (Hal 14-15)"}
          </span>
        </div>

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

        {/* Global Toast Error / Success notification */}
        {form.errorMsg && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-[var(--color-alert-red)]/15 border border-[var(--color-alert-red)]/40 text-[var(--color-alert-red)] text-xs font-mono flex items-center justify-between">
            <span>{form.errorMsg}</span>
            <button onClick={() => form.setErrorMsg(null)} className="underline text-[10px] cursor-pointer">Tutup</button>
          </div>
        )}
        {form.successMsg && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/40 text-[var(--color-cycling)] text-xs font-mono flex items-center justify-between">
            <span>{form.successMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="flex-1 flex flex-col min-h-0">
          <div
            className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-xl overflow-hidden relative shadow-inner"
            style={{
              borderColor: "var(--color-border)",
              borderWidth: "1px",
            }}
          >
            {form.step === 1 ? (
              <>
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

                {/* 📖 HALAMAN KANAN (RIGHT PAGE): Formulir Manual */}
                <AddActivityRightPage
                  defaultWorkout={defaultWorkout}
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
                  isSubmitting={form.isSubmitting}
                  isParsingImage={form.isParsingImage}
                  onNextStep={form.handleNextStep}
                  onClose={form.handleClose}
                />
              </>
            ) : (
              <>
                {/* 📖 HALAMAN 14 (LEFT PAGE): Check-in Pasca Latihan (Gambar 2) */}
                <AddActivityCheckinLeftPage
                  sportType={form.sportType}
                  name={form.name}
                  startDate={form.startDate}
                  numericDistanceKm={form.numericDistanceKm}
                  totalDurationSeconds={form.totalDurationSeconds}
                  durationHours={form.durationHours}
                  durationMinutes={form.durationMinutes}
                  durationSeconds={form.durationSeconds}
                  calculatedSpeedKmh={form.calculatedSpeedKmh}
                  calculatedPaceMinKm={form.calculatedPaceMinKm}
                  painDuring={form.painDuring}
                  setPainDuring={form.setPainDuring}
                  painAfter={form.painAfter}
                  setPainAfter={form.setPainAfter}
                  painNextDay={form.painNextDay}
                  setPainNextDay={form.setPainNextDay}
                  swellingObserved={form.swellingObserved}
                  setSwellingObserved={form.setSwellingObserved}
                  instabilityObserved={form.instabilityObserved}
                  setInstabilityObserved={form.setInstabilityObserved}
                  rpeScore={form.rpeScore}
                  setRpeScore={form.setRpeScore}
                  subjectiveNotes={form.subjectiveNotes}
                  setSubjectiveNotes={form.setSubjectiveNotes}
                />

                {/* 📖 HALAMAN 15 (RIGHT PAGE): Evaluasi Insiden & Cedera Baru */}
                <AddActivityInjuryRightPage
                  hasNewInjury={form.hasNewInjury}
                  setHasNewInjury={form.setHasNewInjury}
                  injuryRegion={form.injuryRegion}
                  setInjuryRegion={form.setInjuryRegion}
                  injurySide={form.injurySide}
                  setInjurySide={form.setInjurySide}
                  injurySeverity={form.injurySeverity}
                  setInjurySeverity={form.setInjurySeverity}
                  injuryMechanism={form.injuryMechanism}
                  setInjuryMechanism={form.setInjuryMechanism}
                  injuryNotes={form.injuryNotes}
                  setInjuryNotes={form.setInjuryNotes}
                  isSubmitting={form.isSubmitting}
                  onPrevStep={form.handlePrevStep}
                  onSubmit={form.handleSubmit}
                />
              </>
            )}

            {/* Garis Lipatan Tengah Buku */}
            <div
              className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20 border-x"
              style={{
                background: `linear-gradient(to right, var(--color-book-crease-start), var(--color-book-crease-mid), var(--color-book-crease-start))`,
                borderColor: "var(--color-border)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
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
