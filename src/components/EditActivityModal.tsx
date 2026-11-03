"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "@/types";
import {
  Pencil,
  X,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Compass,
  Clock,
  Mountain,
} from "lucide-react";

interface EditActivityModalProps {
  activity: Activity;
  variant?: "button" | "icon" | "inline";
}

function toDateTimeLocal(isoStr: string) {
  try {
    const d = new Date(isoStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function EditActivityModal({
  activity,
  variant = "button",
}: EditActivityModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState(activity.name);
  const [sportType, setSportType] = useState(activity.sport_type);
  const [startDate, setStartDate] = useState(toDateTimeLocal(activity.start_date));
  const [description, setDescription] = useState(activity.description || "");
  const [distanceKm, setDistanceKm] = useState(
    (Number(activity.distance_meters || 0) / 1000).toFixed(2)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    Math.round(Number(activity.moving_time_seconds || 0) / 60).toString()
  );
  const [elevationMeters, setElevationMeters] = useState(
    Math.round(Number(activity.elevation_gain_meters || 0)).toString()
  );

  const [isCustomSport, setIsCustomSport] = useState(false);
  const [customSportInput, setCustomSportInput] = useState("");
  const sportOptions = ["Run", "Ride", "Swim", "Walk", "Hike", "WeightTraining", "Workout"];

  const handleOpen = () => {
    setName(activity.name);
    setSportType(activity.sport_type);
    const isPreset = sportOptions.some((s) => s.toLowerCase() === activity.sport_type.toLowerCase());
    setIsCustomSport(!isPreset);
    setCustomSportInput(!isPreset ? activity.sport_type : "");
    setStartDate(toDateTimeLocal(activity.start_date));
    setDescription(activity.description || "");
    setDistanceKm((Number(activity.distance_meters || 0) / 1000).toFixed(2));
    setDurationMinutes(
      Math.round(Number(activity.moving_time_seconds || 0) / 60).toString()
    );
    setElevationMeters(
      Math.round(Number(activity.elevation_gain_meters || 0)).toString()
    );
    setError(null);
    setSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama aktivitas tidak boleh kosong.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const distMeters = Math.max(0, parseFloat(distanceKm) * 1000);
      const timeSeconds = Math.max(0, parseInt(durationMinutes, 10) * 60);
      const elevMeters = Math.max(0, parseInt(elevationMeters, 10));
      const isoDate = startDate ? new Date(startDate).toISOString() : undefined;

      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          sport_type: sportType,
          start_date: isoDate,
          description: description.trim(),
          distance_meters: isNaN(distMeters) ? undefined : distMeters,
          moving_time_seconds: isNaN(timeSeconds) ? undefined : timeSeconds,
          elevation_gain_meters: isNaN(elevMeters) ? undefined : elevMeters,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gagal menyimpan perubahan.");
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 500);
    } catch (err: any) {
      console.error("Error saving activity:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "button" ? (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#00F0FF] text-[#9BA3AF] hover:text-[#00F0FF] transition-colors text-xs font-mono font-medium"
          title="Edit Data Sesi Telemetri"
        >
          <Pencil className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Edit Sesi</span>
        </button>
      ) : variant === "inline" ? (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#9BA3AF] hover:text-[#00F0FF] transition-colors group cursor-pointer"
          title="Ubah Tanggal & Waktu Aktivitas"
        >
          <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          <span className="underline decoration-dotted underline-offset-2">Ubah Waktu</span>
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#00F0FF] text-[#9BA3AF] hover:text-[#00F0FF] transition-colors"
          title="Edit Data Sesi Telemetri"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-[#12151D] border border-[#1F2430] rounded-sm p-5 space-y-4 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center text-[#00F0FF]">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#F0F2F5]">
                    Edit Telemetri Aktivitas
                  </h3>
                  <p className="text-[10px] font-mono text-[#5A6272]">
                    Strava Activity ID: #{activity.strava_activity_id}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                disabled={loading}
                className="p-1.5 rounded-sm text-[#9BA3AF] hover:text-white hover:bg-[#161922] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Banner */}
            {error && (
              <div className="p-2.5 rounded-sm bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-[#FF2A6D] text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 rounded-sm bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Perubahan berhasil disimpan. Memperbarui telemetri...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nama Aktivitas */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-mono text-[#9BA3AF] block font-medium">
                  Nama Sesi Latihan
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunday Endurance Long Run"
                  disabled={loading}
                  className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF] font-mono"
                  required
                />
              </div>

              {/* Tanggal & Waktu Aktivitas */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-mono text-[#9BA3AF] block font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF9500]" />
                    <span>Tanggal & Jam Sesi Latihan</span>
                  </span>
                  <span className="text-[10px] text-[#5A6272] font-normal">
                    Format: Tanggal & Waktu Lokal
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF] font-mono [color-scheme:dark]"
                  required
                />
              </div>

              {/* Sport Type */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-mono text-[#9BA3AF] block font-medium">
                    Kategori Olahraga
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSport(!isCustomSport);
                      if (!isCustomSport && customSportInput) {
                        setSportType(customSportInput);
                      }
                    }}
                    className="text-[10px] text-[#00F0FF] hover:underline cursor-pointer"
                  >
                    {isCustomSport ? "← Pilih dari Preset" : "+ Cabang Kustom"}
                  </button>
                </div>

                {!isCustomSport ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {sportOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setSportType(opt)}
                        disabled={loading}
                        className={`px-2 py-1 rounded-sm text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          sportType.toLowerCase() === opt.toLowerCase()
                            ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-bold shadow-xs"
                            : "bg-[#161922] text-[#9BA3AF] border border-[#1F2430] hover:text-white"
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customSportInput}
                      onChange={(e) => {
                        setCustomSportInput(e.target.value);
                        setSportType(e.target.value.trim() || "Workout");
                      }}
                      placeholder="Masukkan nama cabang baru (misal: Trail Run, Rowing, Padel)..."
                      className="flex-1 px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#00F0FF]/50 text-xs text-white focus:outline-none font-mono"
                      autoFocus
                    />
                    <span className="px-2 py-1 rounded-sm bg-[#00F0FF]/15 text-[#00F0FF] font-bold text-[10px] border border-[#00F0FF]/30">
                      {customSportInput.trim() || "Kustom"}
                    </span>
                  </div>
                )}
              </div>

              {/* Deskripsi & Catatan */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-mono text-[#9BA3AF] block font-medium">
                  Catatan Latihan / Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tambahkan catatan fisiologis, kondisi cuaca, sensasi RPE, atau target interval..."
                  rows={2}
                  disabled={loading}
                  className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF] font-mono leading-relaxed resize-none"
                />
              </div>

              {/* Penyesuaian Kinematik (Jarak, Waktu, Elevasi) */}
              <div className="pt-2 border-t border-[#1F2430]/60 space-y-2">
                <span className="text-[10px] uppercase font-mono text-[#5A6272] block tracking-wider">
                  Kalibrasi Kinematik (Opsional)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#9BA3AF] flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#00F0FF]" />
                      <span>Jarak (km)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      disabled={loading}
                      className="w-full px-2 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] font-mono font-tabular"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#9BA3AF] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#10B981]" />
                      <span>Durasi (Menit)</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      disabled={loading}
                      className="w-full px-2 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] font-mono font-tabular"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#9BA3AF] flex items-center gap-1">
                      <Mountain className="w-3 h-3 text-[#FF9500]" />
                      <span>Elevasi (m)</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={elevationMeters}
                      onChange={(e) => setElevationMeters(e.target.value)}
                      disabled={loading}
                      className="w-full px-2 py-1 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] font-mono font-tabular"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1F2430] flex items-center justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-sm bg-[#161922] hover:bg-[#1C212E] text-[#9BA3AF] hover:text-white border border-[#1F2430] text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-sm bg-[#00F0FF] hover:bg-[#00c8d6] text-black font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
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
