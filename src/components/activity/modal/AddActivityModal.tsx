"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Activity as ActivityIcon,
  FileText,
  RefreshCw,
  Check,
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
  const [activeTab, setActiveTab] = useState<"image" | "manual">("image");

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
  const [rpeScore, setRpeScore] = useState<number>(3); // Default Zone 2 (RPE 3)
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

  // Live kinematic calculations
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
        // Clinical response fields
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
          ? `Aktivitas berhasil dicatat dan disinkronkan ke sesi: ${data.matchedWorkout.workout_category} (Status: COMPLETED)!`
          : "Aktivitas berhasil disimpan ke basis data telemetri!"
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

  return (
    <>
      {/* Trigger Buttons */}
      {variant === "button" && (
        <button
          onClick={handleOpen}
          className="px-3.5 py-1.5 rounded-md bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-semibold font-mono tracking-tight transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>TAMBAH AKTIVITAS</span>
        </button>
      )}

      {variant === "outline" && (
        <button
          onClick={handleOpen}
          className="px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Tambah Aktivitas Manual / Foto</span>
        </button>
      )}

      {variant === "compact" && (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] transition-colors shadow-xs"
          title="Tambah Aktivitas Manual"
        >
          <Plus className="w-4 h-4 text-[var(--color-cycling)]" />
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-cycling)]">
                  <ActivityIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
                    INPUT AKTIVITAS TELEMETRI BARU
                    {defaultWorkout && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)]">
                        Target: {defaultWorkout.workout_category}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                    Ekstraksi otomatis via screenshot kamera (OCR) atau input formulir manual.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting || isParsingImage}
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)] border border-transparent hover:border-[var(--color-border)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ingestion Mode Tabs */}
            <div className="px-5 pt-3 pb-2 bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "image"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                <span>Unggah Foto Telemetri (OCR)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "manual"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[var(--color-running)]" />
                <span>Formulir Manual</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 rounded-md bg-[var(--color-alert-red)]/10 border border-[var(--color-alert-red)]/30 flex items-start gap-2.5 text-xs text-[var(--color-alert-red)] font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan: </span>
                    {errorMsg}
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 rounded-md bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 flex items-start gap-2.5 text-xs text-[var(--color-cycling)] font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Berhasil: </span>
                    {successMsg}
                  </div>
                </div>
              )}

              {/* TAB 1: OCR IMAGE INGESTION */}
              {activeTab === "image" && (
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
              )}

              {/* TAB 2 or BELOW OCR: FORM FIELDS */}
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

              {/* ZONE 2 & JOINT HEALTH AUDIT */}
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

              {/* Submit & Cancel Actions */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5 font-mono">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting || isParsingImage}
                  className="px-4 py-2 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isParsingImage}
                  className="px-5 py-2 rounded-md bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SIMPAN AKTIVITAS KE BASIS DATA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
