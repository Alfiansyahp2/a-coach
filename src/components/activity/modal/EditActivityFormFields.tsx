"use client";

import React from "react";
import {
  Calendar,
  Compass,
  Clock,
  Mountain,
} from "lucide-react";

interface EditActivityFormFieldsProps {
  name: string;
  setName: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  sportType: string;
  setSportType: (v: string) => void;
  isCustomSport: boolean;
  setIsCustomSport: (v: boolean) => void;
  customSportInput: string;
  setCustomSportInput: (v: string) => void;
  sportOptions: string[];
  description: string;
  setDescription: (v: string) => void;
  distanceKm: string;
  setDistanceKm: (v: string) => void;
  durationMinutes: string;
  setDurationMinutes: (v: string) => void;
  elevationMeters: string;
  setElevationMeters: (v: string) => void;
  loading: boolean;
}

export function EditActivityFormFields({
  name,
  setName,
  startDate,
  setStartDate,
  sportType,
  setSportType,
  isCustomSport,
  setIsCustomSport,
  customSportInput,
  setCustomSportInput,
  sportOptions,
  description,
  setDescription,
  distanceKm,
  setDistanceKm,
  durationMinutes,
  setDurationMinutes,
  elevationMeters,
  setElevationMeters,
  loading,
}: EditActivityFormFieldsProps) {
  return (
    <>
      {/* Nama Aktivitas */}
      <div className="space-y-1">
        <label className="text-[11px] uppercase font-mono text-[var(--color-text-secondary)] block font-semibold">
          Nama Sesi Latihan
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sunday Endurance Long Run"
          disabled={loading}
          className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] font-mono"
          required
        />
      </div>

      {/* Tanggal & Waktu Aktivitas */}
      <div className="space-y-1">
        <label className="text-[11px] uppercase font-mono text-[var(--color-text-secondary)] block font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-running)]" />
            <span>Tanggal &amp; Jam Sesi Latihan</span>
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-normal">
            Format: Tanggal &amp; Waktu Lokal
          </span>
        </label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] font-mono"
          required
        />
      </div>

      {/* Sport Type */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase font-mono text-[var(--color-text-secondary)] block font-semibold">
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
            className="text-[10px] text-[var(--color-cycling)] hover:underline cursor-pointer font-semibold"
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
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  sportType.toLowerCase() === opt.toLowerCase()
                    ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/40 font-bold shadow-xs"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
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
              className="flex-1 px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] font-mono"
              autoFocus
            />
            <span className="px-2.5 py-1 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] font-bold text-[10px] border border-[var(--color-cycling)]/30">
              {customSportInput.trim() || "Kustom"}
            </span>
          </div>
        )}
      </div>

      {/* Deskripsi & Catatan */}
      <div className="space-y-1">
        <label className="text-[11px] uppercase font-mono text-[var(--color-text-secondary)] block font-semibold">
          Catatan Latihan / Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tambahkan catatan fisiologis, kondisi cuaca, sensasi RPE, atau target interval..."
          rows={2}
          disabled={loading}
          className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] font-mono leading-relaxed resize-none"
        />
      </div>

      {/* Penyesuaian Kinematik (Jarak, Waktu, Elevasi) */}
      <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
        <span className="text-[10px] uppercase font-mono text-[var(--color-text-muted)] block tracking-wider font-semibold">
          Kalibrasi Kinematik (Opsional)
        </span>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[var(--color-text-secondary)] flex items-center gap-1 font-semibold">
              <Compass className="w-3 h-3 text-[var(--color-cycling)]" />
              <span>Jarak (km)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-mono font-tabular focus:border-[var(--color-cycling)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[var(--color-text-secondary)] flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-[var(--color-cycling)]" />
              <span>Durasi (Menit)</span>
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-mono font-tabular focus:border-[var(--color-cycling)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[var(--color-text-secondary)] flex items-center gap-1 font-semibold">
              <Mountain className="w-3 h-3 text-[var(--color-running)]" />
              <span>Elevasi (m)</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={elevationMeters}
              onChange={(e) => setElevationMeters(e.target.value)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-mono font-tabular focus:border-[var(--color-running)]"
            />
          </div>
        </div>
      </div>
    </>
  );
}

