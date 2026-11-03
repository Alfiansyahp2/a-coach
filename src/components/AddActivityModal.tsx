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
import { ActivityImageUploader } from "./activity/modal/ActivityImageUploader";
import { ActivityManualFormFields } from "./activity/modal/ActivityManualFormFields";
import { ActivityHealthCheckinFields } from "./activity/modal/ActivityHealthCheckinFields";

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
          className="px-3.5 py-1.5 rounded-sm bg-[#D4FF00] hover:bg-[#c2eb00] text-[#090A0F] text-xs font-bold font-mono tracking-tight transition-all duration-150 flex items-center gap-1.5 shadow-md shadow-[#D4FF00]/10"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>TAMBAH AKTIVITAS</span>
        </button>
      )}

      {variant === "outline" && (
        <button
          onClick={handleOpen}
          className="px-3 py-1.5 rounded-sm bg-[#12151D] hover:bg-[#1A1F2C] border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Aktivitas Manual / Foto</span>
        </button>
      )}

      {variant === "compact" && (
        <button
          onClick={handleOpen}
          className="px-2 py-1 rounded-sm bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 text-[#00F0FF] text-[10px] font-mono font-semibold transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>Catat Hasil</span>
        </button>
      )}

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[#0F1218] border border-[#1F2430] rounded-sm shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1F2430] bg-[#12151D] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-[#D4FF00]">
                  <ActivityIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#F0F2F5] tracking-tight flex items-center gap-2">
                    CATAT AKTIVITAS BARU
                    {defaultWorkout && (
                      <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF]">
                        Tautkan ke Sesi Terjadwal
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-[#9BA3AF] font-mono">
                    Entri manual atau ekstrak otomatis dari screenshot Strava / Jam Tangan.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting || isParsingImage}
                className="p-1.5 rounded-sm text-[#9BA3AF] hover:text-white hover:bg-[#1C212E] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="px-5 pt-3 pb-2 bg-[#090A0F] border-b border-[#1F2430] flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("image")}
                className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "image"
                    ? "bg-[#1C212E] text-[#00F0FF] border border-[#00F0FF]/40 font-bold"
                    : "text-[#9BA3AF] hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📸 Scan Screenshot / Foto Telemetri</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "manual"
                    ? "bg-[#1C212E] text-[#D4FF00] border border-[#D4FF00]/40 font-bold"
                    : "text-[#9BA3AF] hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>✍️ Isi Formulir Manual</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 rounded-sm bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-300 font-mono">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan: </span>
                    {errorMsg}
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 rounded-sm bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-300 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Berhasil: </span>
                    {successMsg}
                  </div>
                </div>
              )}

              {/* IMAGE OCR SCANNER SECTION */}
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

              {/* MANUAL FORM FIELDS */}
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

              {/* CLINICAL JOINT & ZONE 2 HEALTH CHECKIN */}
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
              <div className="pt-2 border-t border-[#1F2430] flex items-center justify-end gap-2.5 font-mono">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting || isParsingImage}
                  className="px-4 py-2 rounded-sm text-xs font-medium text-[#9BA3AF] hover:text-white hover:bg-[#161922] transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isParsingImage}
                  className="px-5 py-2 rounded-sm bg-[#D4FF00] hover:bg-[#c2eb00] text-[#090A0F] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#D4FF00]/10 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>SIMPAN AKTIVITAS</span>
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
