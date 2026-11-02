"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Bike,
  Activity as ActivityIcon,
  Clock,
  MapPin,
  Mountain,
  HeartPulse,
  Sparkles,
  RefreshCw,
  FileText,
  Calendar,
  ShieldCheck,
  Check,
} from "lucide-react";
import { ScheduledWorkout } from "@/types";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Image upload and OCR extraction
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setIsParsingImage(true);
    setOcrSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/activities/parse-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memproses gambar telemetri");
      }

      const tel = data.telemetry;
      if (tel) {
        if (tel.sport_type) {
          setSportType(tel.sport_type);
        }
        if (tel.name) {
          setName(tel.name);
        }
        if (tel.distance_km != null) {
          setDistanceKm(String(tel.distance_km));
        }
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
        if (tel.raw_text) {
          setOcrRawText(tel.raw_text);
        }

        const statsBadge = `${tel.distance_km} km • ${tel.formatted_duration} • ${
          tel.average_speed_kmh ? `${tel.average_speed_kmh} km/j` : ""
        } • Elev ${tel.elevation_gain_meters || 0}m`;

        setOcrSuccessMsg(`Telemetri Terdeteksi: ${statsBadge}`);
      }
    } catch (err: any) {
      console.error("OCR parse error:", err);
      setErrorMsg(`OCR Parser: ${err.message}. Anda tetap dapat mengisi formulir secara manual.`);
    } finally {
      setIsParsingImage(false);
    }
  };

  // Calculate speed and pace live
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
                <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#F0F2F5] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                      IMAGE TELEMETRY PARSER (OCR)
                    </span>
                    <span className="text-[10px] text-[#5A6272] font-mono">
                      Format: PNG, JPG, WEBP (Strava / Garmin / Apple Watch)
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Dropzone / Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-sm p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      isParsingImage
                        ? "border-[#00F0FF] bg-[#00F0FF]/5"
                        : imagePreview
                        ? "border-[#1F2430] hover:border-[#00F0FF]/50 bg-[#090A0F]"
                        : "border-[#1F2430] hover:border-[#D4FF00]/50 hover:bg-[#161922] bg-[#090A0F]"
                    }`}
                  >
                    {isParsingImage ? (
                      <div className="py-4 flex flex-col items-center gap-2 text-xs font-mono text-[#00F0FF]">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#00F0FF]" />
                        <span className="font-bold">Membaca dan mengekstrak telemetri gambar...</span>
                        <span className="text-[10px] text-[#9BA3AF]">
                          Memproses watermark rute, jarak, durasi, elevasi & kecepatan
                        </span>
                      </div>
                    ) : imagePreview ? (
                      <div className="flex items-center gap-4 w-full">
                        <img
                          src={imagePreview}
                          alt="Screenshot Pratinjau"
                          className="w-20 h-20 object-cover rounded-xs border border-[#1F2430] bg-black"
                        />
                        <div className="flex-1 text-left font-mono">
                          <p className="text-xs text-[#F0F2F5] font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4FF00]" />
                            Gambar Berhasil Dimuat
                          </p>
                          <p className="text-[10px] text-[#9BA3AF] mt-0.5">
                            Klik di sini untuk mengganti gambar screenshot lain.
                          </p>
                          {ocrSuccessMsg && (
                            <div className="mt-2 text-[11px] text-[#D4FF00] font-bold px-2 py-1 rounded-xs bg-[#D4FF00]/10 border border-[#D4FF00]/30 inline-block">
                              {ocrSuccessMsg}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 flex flex-col items-center gap-1 text-xs font-mono text-[#9BA3AF]">
                        <div className="p-3 rounded-full bg-[#161922] border border-[#1F2430] text-[#00F0FF] mb-1">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-[#F0F2F5] font-bold">
                          Klik untuk Memilih atau Seret Screenshot Aktivitas ke Sini
                        </span>
                        <span className="text-[10px] text-[#5A6272]">
                          Otomatis mengisi form jarak (km), durasi (jam/menit), elevasi (m), dan pace/kecepatan
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FORM FIELDS */}
              <div className="space-y-3.5">
                {/* 1. Sport Type & Activity Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#9BA3AF] uppercase mb-1">
                      Jenis Olahraga
                    </label>
                    <select
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                      className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                    >
                      <option value="Ride">Ride (Sepeda MTB / Road)</option>
                      <option value="Run">Run (Lari)</option>
                      <option value="Walk">Walk (Jalan Kaki)</option>
                      <option value="CrossTraining">Cross Training (Rehab Sendi)</option>
                      <option value="WeightTraining">Strength (Penguatan Otot)</option>
                      <option value="Workout">Workout Lainnya</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono text-[#9BA3AF] uppercase mb-1">
                      Judul / Nama Aktivitas
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Zone 2 MTB Endurance atau Lari Adaptasi Sendi"
                      className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                      required
                    />
                  </div>
                </div>

                {/* 2. Date & Time */}
                <div>
                  <label className="block text-[11px] font-mono text-[#9BA3AF] uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#9BA3AF]" />
                    <span>Waktu & Tanggal Mulai</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                    required
                  />
                </div>

                {/* 3. Distance & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Distance */}
                  <div>
                    <label className="block text-[11px] font-mono text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#00F0FF]" />
                        <span>Jarak Tempuh (Kilometer)</span>
                      </span>
                      <span className="text-[10px] text-[#5A6272]">km</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      placeholder="Contoh: 10.14"
                      className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                      required
                    />
                  </div>

                  {/* Elevation Gain */}
                  <div>
                    <label className="block text-[11px] font-mono text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Mountain className="w-3 h-3 text-[#D4FF00]" />
                        <span>Elevasi Mendaki (Elev Gain)</span>
                      </span>
                      <span className="text-[10px] text-[#5A6272]">meter</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={elevationMeters}
                      onChange={(e) => setElevationMeters(e.target.value)}
                      placeholder="Contoh: 48"
                      className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                </div>

                {/* Duration Inputs: Jam, Menit, Detik */}
                <div>
                  <label className="block text-[11px] font-mono text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00F0FF]" />
                      <span>Durasi Bergerak (Moving Time)</span>
                    </span>
                    <span className="text-[10px] text-[#5A6272]">
                      Total: {Math.floor(totalDurationSeconds / 60)} Menit {totalDurationSeconds % 60} Detik
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5 bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        className="w-full bg-transparent text-xs font-mono font-tabular text-[#F0F2F5] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#5A6272] font-mono">Jam</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="w-full bg-transparent text-xs font-mono font-tabular text-[#F0F2F5] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#5A6272] font-mono">Menit</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={durationSeconds}
                        onChange={(e) => setDurationSeconds(e.target.value)}
                        className="w-full bg-transparent text-xs font-mono font-tabular text-[#F0F2F5] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#5A6272] font-mono">Detik</span>
                    </div>
                  </div>
                </div>

                {/* Live Kinematics Strip */}
                <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5A6272] uppercase">Kecepatan Rerata:</span>
                    <span className="font-bold font-tabular text-[#00F0FF]">
                      {calculatedSpeedKmh} km/jam
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5A6272] uppercase">Pace:</span>
                    <span className="font-bold font-tabular text-[#D4FF00]">
                      {calculatedPaceMinKm} /km
                    </span>
                  </div>
                </div>

                {/* 4. ZONE 2 RPE INTENSITY CALIBRATION */}
                <div className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-[#F0F2F5] flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-[#D4FF00]" />
                      INTENSITAS ZONE 2 & RPE (RATE OF PERCEIVED EXERTION)
                    </label>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-xs ${
                        rpeScore <= 2
                          ? "bg-blue-950/60 text-blue-300 border border-blue-500/30"
                          : rpeScore <= 4
                          ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/40"
                          : rpeScore <= 6
                          ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                          : "bg-red-950/60 text-red-300 border border-red-500/30"
                      }`}
                    >
                      Skala RPE: {rpeScore} / 10
                    </span>
                  </div>

                  {/* RPE Buttons 1-10 */}
                  <div className="grid grid-cols-10 gap-1 font-mono">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        type="button"
                        key={score}
                        onClick={() => setRpeScore(score)}
                        className={`py-1.5 text-xs font-bold rounded-xs transition-colors ${
                          rpeScore === score
                            ? score <= 4
                              ? "bg-[#D4FF00] text-black font-extrabold"
                              : score <= 6
                              ? "bg-amber-500 text-black font-extrabold"
                              : "bg-red-500 text-white font-extrabold"
                            : "bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-white"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-[#9BA3AF] font-mono leading-relaxed">
                    {rpeScore <= 4 ? (
                      <span className="text-[#D4FF00]">
                        ✓ Target Zone 2 Tercapai (Talk Test OK): Pernapasan stabil, dapat berbicara kalimat lengkap tanpa terengah-engah.
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        ⚠ Intensitas di atas Zone 2: Nafas mulai memburu / tidak bisa bicara kalimat penuh. Disarankan menurunkan gigi kayuhan atau pace di sesi berikutnya.
                      </span>
                    )}
                  </p>
                </div>

                {/* 5. INJURY & JOINT SAFETY CHECK-IN (ANKLE & KNEE) */}
                <div className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-[#F0F2F5] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                      CHECK-IN KESEHATAN SENDI (ENGKEL & KEDUA LUTUT)
                    </label>
                    <span className="text-[10px] text-[#5A6272] font-mono">Protokol Keamanan</span>
                  </div>

                  {/* Pain Scale */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#9BA3AF]">Tingkat Nyeri Saat / Setelah Latihan:</span>
                      <span
                        className={`font-bold ${
                          painScale === 0
                            ? "text-[#D4FF00]"
                            : painScale <= 3
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {painScale === 0 ? "0 (Bebas Nyeri)" : `${painScale} / 10`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={painScale}
                      onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
                      className="w-full accent-[#00F0FF] bg-[#090A0F] h-1.5 rounded-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#5A6272]">
                      <span>0 - Bebas Nyeri</span>
                      <span>3 - Ringan / Aman</span>
                      <span>5 - Mengganggu</span>
                      <span>10 - Nyeri Akut</span>
                    </div>
                  </div>

                  {/* Joint Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-sm bg-[#090A0F] border border-[#1F2430] cursor-pointer hover:border-[#2D3547]">
                      <input
                        type="checkbox"
                        checked={swellingObserved}
                        onChange={(e) => setSwellingObserved(e.target.checked)}
                        className="accent-[#00F0FF] rounded-none"
                      />
                      <span className="text-[#9BA3AF] text-[11px]">Ada pembengkakan sendi</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-sm bg-[#090A0F] border border-[#1F2430] cursor-pointer hover:border-[#2D3547]">
                      <input
                        type="checkbox"
                        checked={instabilityObserved}
                        onChange={(e) => setInstabilityObserved(e.target.checked)}
                        className="accent-[#00F0FF] rounded-none"
                      />
                      <span className="text-[#9BA3AF] text-[11px]">Ada rasa goyang / tidak stabil</span>
                    </label>
                  </div>
                </div>

                {/* 6. Description & Athlete Notes */}
                <div>
                  <label className="block text-[11px] font-mono text-[#9BA3AF] uppercase mb-1">
                    Catatan Atlet / Sensasi Latihan
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Kayuhan stabil di gear 3-4, jalan datar, hidrasi cukup, lutut dan engkel aman tanpa keluhan."
                    className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

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
