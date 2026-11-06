"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  X,
  RefreshCw,
  Check,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  PenLine,
  Bookmark,
} from "lucide-react";
import { ScheduledWorkout } from "@/types";
import { ActivityImageUploader } from "./ActivityImageUploader";
import { ActivityManualFormFields } from "./ActivityManualFormFields";
import { ActivityHealthCheckinFields } from "./ActivityHealthCheckinFields";

interface AddActivityModalProps {
  variant?: "button" | "outline" | "compact";
  defaultSportType?: string;
  defaultDate?: string;
  defaultWorkout?: ScheduledWorkout | null;
  onSuccess?: () => void;
}

function toDateTimeLocal(d: Date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AddActivityModal({
  variant = "button",
  defaultSportType = "Ride",
  defaultDate,
  defaultWorkout = null,
  onSuccess,
}: AddActivityModalProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [sportType, setSportType] = useState<string>(
    defaultWorkout
      ? defaultWorkout.workout_category.toLowerCase().includes("cycl") ||
        defaultWorkout.workout_category.toLowerCase().includes("ride")
        ? "Ride"
        : defaultWorkout.workout_category.toLowerCase().includes("run") ||
          defaultWorkout.workout_category.toLowerCase().includes("lari")
        ? "Run"
        : "CrossTraining"
      : defaultSportType
  );
  const [name, setName] = useState<string>(
    defaultWorkout ? `Sesi ${defaultWorkout.workout_category}` : ""
  );
  const [startDate, setStartDate] = useState<string>(() => {
    if (defaultDate) {
      return `${defaultDate}T07:00`;
    }
    return toDateTimeLocal(new Date());
  });
  const [distanceKm, setDistanceKm] = useState<string>(
    defaultWorkout && defaultWorkout.target_distance_meters
      ? (defaultWorkout.target_distance_meters / 1000).toFixed(1)
      : ""
  );
  const [durationHours, setDurationHours] = useState<string>("0");
  const [durationMinutes, setDurationMinutes] = useState<string>(
    defaultWorkout && defaultWorkout.target_duration_seconds
      ? String(Math.floor(defaultWorkout.target_duration_seconds / 60))
      : "45"
  );
  const [durationSeconds, setDurationSeconds] = useState<string>("0");
  const [elevationMeters, setElevationMeters] = useState<string>("35");
  const [description, setDescription] = useState<string>("");

  // Health & Zone 2 metrics
  const [rpeScore, setRpeScore] = useState<number>(3);
  const [painScale, setPainScale] = useState<number>(0);
  const [swellingObserved, setSwellingObserved] = useState<boolean>(false);
  const [instabilityObserved, setInstabilityObserved] = useState<boolean>(false);

  // OCR state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isParsingImage, setIsParsingImage] = useState<boolean>(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrRawText, setOcrRawText] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpen = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOcrSuccessMsg(null);
    setImagePreview(null);
    setOcrRawText(null);
    if (!name) {
      setName(sportType === "Ride" ? "Latihan MTB Zone 2" : "Latihan Lari Rekondisi");
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isSubmitting && !isParsingImage) {
      setIsOpen(false);
    }
  };

  const handleTelemetryExtracted = (tel: {
    sport_type?: string;
    name?: string;
    distance_km?: number;
    moving_time_seconds?: number;
    elevation_gain_meters?: number;
    average_speed_kmh?: number;
  }) => {
    if (tel.sport_type) setSportType(tel.sport_type);
    if (tel.name) setName(tel.name);
    if (tel.distance_km != null) setDistanceKm(String(tel.distance_km));
    if (tel.moving_time_seconds != null) {
      const totalSec = Number(tel.moving_time_seconds);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setDurationHours(String(h));
      setDurationMinutes(String(m));
      setDurationSeconds(String(s));
    }
    if (tel.elevation_gain_meters != null) {
      setElevationMeters(String(tel.elevation_gain_meters));
    }
  };

  const totalDurationSeconds =
    (parseInt(durationHours || "0", 10) || 0) * 3600 +
    (parseInt(durationMinutes || "0", 10) || 0) * 60 +
    (parseInt(durationSeconds || "0", 10) || 0);

  const numericDistanceKm = parseFloat(distanceKm || "0") || 0;

  const calculatedSpeedKmh =
    totalDurationSeconds > 0 && numericDistanceKm > 0
      ? ((numericDistanceKm / totalDurationSeconds) * 3600).toFixed(1)
      : "0.0";

  const calculatedPaceMinKm =
    numericDistanceKm > 0 && totalDurationSeconds > 0
      ? (() => {
          const secPerKm = totalDurationSeconds / numericDistanceKm;
          const mins = Math.floor(secPerKm / 60);
          const secs = Math.floor(secPerKm % 60);
          return `${mins}:${String(secs).padStart(2, "0")}`;
        })()
      : "--:--";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama aktivitas wajib diisi.");
      return;
    }
    if (numericDistanceKm <= 0 && totalDurationSeconds <= 0) {
      setErrorMsg("Masukkan jarak tempuh atau durasi aktivitas yang valid.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const distanceMeters = Math.round(numericDistanceKm * 1000);
      const avgSpeedMps =
        totalDurationSeconds > 0 && distanceMeters > 0
          ? Number((distanceMeters / totalDurationSeconds).toFixed(2))
          : 0;

      const payload = {
        name: name.trim(),
        sport_type: sportType,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        distance_meters: distanceMeters,
        moving_time_seconds: totalDurationSeconds,
        elapsed_time_seconds: totalDurationSeconds,
        elevation_gain_meters: parseInt(elevationMeters || "0", 10) || 0,
        average_speed_mps: avgSpeedMps,
        description: description.trim() || undefined,
        workout_id: defaultWorkout?.id || undefined,
        rpe_score: rpeScore,
        pain_during_activity: painScale,
        pain_after_activity: painScale,
        swelling_observed: swellingObserved,
        instability_observed: instabilityObserved,
        athlete_comments: description.trim() || undefined,
      };

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan aktivitas.");
      }

      setSuccessMsg(
        data.matchedWorkout
          ? `Sesi tercatat di buku jurnal & tersinkronisasi ke: ${data.matchedWorkout.workout_category}!`
          : "Catatan sesi berhasil ditulis ke buku jurnal telemetri!"
      );

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
        onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan aktivitas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalDialog = isOpen ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar Floating Controls */}
      <div className="absolute top-3 right-4 sm:right-6 z-[100000] flex items-center gap-2">
        <button
          onClick={handleClose}
          disabled={isSubmitting || isParsingImage}
          className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] font-mono text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Tutup Buku</span>
        </button>
      </div>

      {/* THE OPEN BOOK CONTAINER (Kulit Buku Responsif via CSS Variables) */}
      <div
        className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl p-2.5 sm:p-4 shadow-2xl relative overflow-hidden transition-colors duration-200"
        style={{
          backgroundColor: "var(--color-book-cover)",
          borderColor: "var(--color-book-cover-border)",
          borderWidth: "1px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pita Pembatas Buku Merah/Emas di Punggung Buku Tengah Atas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-8 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-800 rounded-b-md shadow-md z-30 flex items-end justify-center pb-1 pointer-events-none">
          <div className="w-3 h-1 bg-amber-300 dark:bg-amber-400/60 rounded-full" />
        </div>

        {/* FORM WRAPPER MENCAKUP KEDUA HALAMAN */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* TWO PAGES SPREAD (HALAMAN KIRI & HALAMAN KANAN) */}
          <div
            className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-xl overflow-hidden relative shadow-inner"
            style={{
              borderColor: "var(--color-border)",
              borderWidth: "1px",
            }}
          >
            
            {/* ============================================================ */}
            {/* 📖 HALAMAN KIRI (LEFT PAGE): Telemetri, Foto OCR & Kinematika */}
            {/* ============================================================ */}
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

            {/* ============================================================ */}
            {/* 📖 HALAMAN KANAN (RIGHT PAGE): Formulir Manual & Audit Klinis */}
            {/* ============================================================ */}
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

                {/* Audit Medis Sendi & RPE */}
                <ActivityHealthCheckinFields
                  rpeScore={rpeScore}
                  setRpeScore={setRpeScore}
                  painScale={painScale}
                  setPainScale={setPainScale}
                  swellingObserved={swellingObserved}
                  setSwellingObserved={setSwellingObserved}
                  instabilityObserved={instabilityObserved}
                  setInstabilityObserved={setInstabilityObserved}
                />
              </div>

              {/* Footer Halaman Kanan (Tombol Tulis Jurnal) */}
              <div
                className="mt-auto pt-4 border-t-2 flex items-center justify-between font-mono"
                style={{ borderColor: "var(--color-border)" }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting || isParsingImage}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors cursor-pointer"
                >
                  Batal / Tutup Lembaran
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isParsingImage}
                  className="px-6 py-2.5 rounded-lg bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
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

            {/* Garis Lipatan Tengah Buku (Book Crease Shadow) */}
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
          onClick={handleOpen}
          className="px-3.5 py-1.5 rounded-md bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-semibold font-mono tracking-tight transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <BookOpen className="w-4 h-4 stroke-[2.2]" />
          <span>+ TAMBAH AKTIVITAS</span>
        </button>
      )}

      {variant === "outline" && (
        <button
          onClick={handleOpen}
          className="px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Buka Buku Jurnal</span>
        </button>
      )}

      {variant === "compact" && (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] transition-colors shadow-xs cursor-pointer"
          title="Buka Buku Catatan Aktivitas"
        >
          <BookOpen className="w-4 h-4 text-[var(--color-cycling)]" />
        </button>
      )}

      {/* Render via Portal to document.body for top-level stacking */}
      {mounted && typeof document !== "undefined" && modalDialog
        ? createPortal(modalDialog, document.body)
        : modalDialog}
    </>
  );
}
