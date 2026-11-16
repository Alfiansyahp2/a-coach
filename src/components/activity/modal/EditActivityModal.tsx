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
} from "lucide-react";
import { EditActivityFormFields } from "./EditActivityFormFields";

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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-mono font-medium shadow-xs"
          title="Edit Data Sesi Telemetri"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Edit Sesi</span>
        </button>
      ) : variant === "inline" ? (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-cycling)] transition-colors group cursor-pointer"
          title="Ubah Tanggal & Waktu Aktivitas"
        >
          <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          <span className="underline decoration-dotted underline-offset-2">Ubah Waktu</span>
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
          title="Edit Data Sesi Telemetri"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-4 shadow-2xl relative font-mono text-xs"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)]">
                    Edit Telemetri Aktivitas
                  </h3>
                  <p className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    Strava Activity ID: #{activity.strava_activity_id}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                disabled={loading}
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Banner */}
            {error && (
              <div className="p-3 rounded-md bg-[var(--color-alert-red)]/10 border border-[var(--color-alert-red)]/30 text-[var(--color-alert-red)] text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)] text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Perubahan berhasil disimpan. Memperbarui telemetri...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <EditActivityFormFields
                name={name}
                setName={setName}
                startDate={startDate}
                setStartDate={setStartDate}
                sportType={sportType}
                setSportType={setSportType}
                isCustomSport={isCustomSport}
                setIsCustomSport={setIsCustomSport}
                customSportInput={customSportInput}
                setCustomSportInput={setCustomSportInput}
                sportOptions={sportOptions}
                description={description}
                setDescription={setDescription}
                distanceKm={distanceKm}
                setDistanceKm={setDistanceKm}
                durationMinutes={durationMinutes}
                setDurationMinutes={setDurationMinutes}
                elevationMeters={elevationMeters}
                setElevationMeters={setElevationMeters}
                loading={loading}
              />


              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5 font-mono">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-md bg-[var(--color-cycling)] hover:opacity-90 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
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
