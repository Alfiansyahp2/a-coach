"use client";

import React from "react";
import { Clock, MapPin, Mountain, PenTool } from "lucide-react";
import { SportTypeSelector } from "./SportTypeSelector";

interface ActivityManualFormFieldsProps {
  sportType: string;
  setSportType: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  distanceKm: string;
  setDistanceKm: (v: string) => void;
  durationHours: string;
  setDurationHours: (v: string) => void;
  durationMinutes: string;
  setDurationMinutes: (v: string) => void;
  durationSeconds: string;
  setDurationSeconds: (v: string) => void;
  elevationMeters: string;
  setElevationMeters: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  calculatedSpeedKmh: string;
  calculatedPaceMinKm: string;
}

export function ActivityManualFormFields(props: ActivityManualFormFieldsProps) {
  const {
    sportType, setSportType, name, setName, startDate, setStartDate,
    distanceKm, setDistanceKm, durationHours, setDurationHours,
    durationMinutes, setDurationMinutes, durationSeconds, setDurationSeconds,
    elevationMeters, setElevationMeters, description, setDescription,
    calculatedSpeedKmh, calculatedPaceMinKm,
  } = props;

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header section in notebook */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--color-border)]">
        <span className="text-xs font-bold text-[var(--color-cycling)] flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5" />
          KOLOM ENTRI AKTIVITAS ATLET
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Jurnal Mandiri</span>
      </div>

      {/* Modular Sport Type Selector */}
      <SportTypeSelector sportType={sportType} setSportType={setSportType} />

      {/* Name and Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">
            Judul / Nama Aktivitas
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: MTB Zone 2 Endurance Pagi / Walk-Jog Recovery"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">
            Waktu &amp; Tanggal
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] font-tabular"
            required
          />
        </div>
      </div>

      {/* Distance, Duration & Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Distance */}
        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[var(--color-cycling)]">
              <MapPin className="w-3 h-3" />
              <span>Jarak Tempuh</span>
            </span>
            <span className="text-[9px] text-[var(--color-text-muted)]">kilometer</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[var(--color-text-primary)]">
              <Clock className="w-3 h-3 text-[var(--color-cycling)]" />
              <span>Durasi Waktu</span>
            </span>
            <span className="text-[9px] text-[var(--color-text-muted)]">jam : mnt : dtk</span>
          </label>
          <div className="grid grid-cols-3 gap-1 font-tabular">
            <input
              type="number"
              min="0"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              placeholder="0h"
              className="px-2 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] text-center focus:outline-none focus:border-[var(--color-cycling)]"
            />
            <input
              type="number"
              min="0"
              max="59"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="0m"
              className="px-2 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] text-center focus:outline-none focus:border-[var(--color-cycling)]"
              required
            />
            <input
              type="number"
              min="0"
              max="59"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="0s"
              className="px-2 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] text-center focus:outline-none focus:border-[var(--color-cycling)]"
            />
          </div>
        </div>

        {/* Elevation Gain */}
        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[var(--color-running)]">
              <Mountain className="w-3 h-3" />
              <span>Elevasi Naik</span>
            </span>
            <span className="text-[9px] text-[var(--color-text-muted)]">meter</span>
          </label>
          <input
            type="number"
            min="0"
            value={elevationMeters}
            onChange={(e) => setElevationMeters(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-running)]"
          />
        </div>
      </div>

      {/* Realtime Live Kinematics Strip */}
      <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-between text-[11px] shadow-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[9px] text-[var(--color-text-muted)] block">Kecepatan Rata-rata</span>
            <span className="font-bold text-[var(--color-text-primary)] font-tabular">{calculatedSpeedKmh} km/jam</span>
          </div>
          <div>
            <span className="text-[9px] text-[var(--color-text-muted)] block">Pace Rata-rata</span>
            <span className="font-bold text-[var(--color-running)] font-tabular">{calculatedPaceMinKm} /km</span>
          </div>
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] italic">
          * Dihitung otomatis dari durasi &amp; jarak
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">
          Catatan / Deskripsi Lapangan
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tuliskan catatan rute, sensasi latihan, cuaca, nutrisi, atau hambatan teknis..."
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-cycling)]"
        />
      </div>
    </div>
  );
}
