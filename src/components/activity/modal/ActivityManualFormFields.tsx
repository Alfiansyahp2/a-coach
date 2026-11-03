"use client";

import React, { useState } from "react";
import {
  Bike,
  Footprints,
  Waves,
  Dumbbell,
  Compass,
  Activity as ActivityIcon,
  Plus,
  Clock,
  MapPin,
  Mountain,
  Tag,
} from "lucide-react";

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

export function ActivityManualFormFields({
  sportType,
  setSportType,
  name,
  setName,
  startDate,
  setStartDate,
  distanceKm,
  setDistanceKm,
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  durationSeconds,
  setDurationSeconds,
  elevationMeters,
  setElevationMeters,
  description,
  setDescription,
  calculatedSpeedKmh,
  calculatedPaceMinKm,
}: ActivityManualFormFieldsProps) {
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => {
    const presets = ["Ride", "Run", "Swim", "Walk", "WeightTraining", "Workout"];
    return !presets.includes(sportType);
  });
  const [customInput, setCustomInput] = useState<string>(() => {
    const presets = ["Ride", "Run", "Swim", "Walk", "WeightTraining", "Workout"];
    return presets.includes(sportType) ? "" : sportType;
  });

  const presetSports = [
    { id: "Ride", label: "Sepeda", icon: Bike },
    { id: "Run", label: "Lari", icon: Footprints },
    { id: "Swim", label: "Renang", icon: Waves },
    { id: "Walk", label: "Jalan", icon: Compass },
    { id: "WeightTraining", label: "Gym / Beban", icon: Dumbbell },
    { id: "Workout", label: "Umum", icon: ActivityIcon },
  ];

  const handleSelectPreset = (id: string) => {
    setIsCustomMode(false);
    setSportType(id);
  };

  const handleEnableCustom = () => {
    setIsCustomMode(true);
    if (customInput.trim()) {
      setSportType(customInput.trim());
    }
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInput(val);
    setSportType(val.trim() || "Workout");
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Sport Type Selector & Custom Sport Creator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold">
            Kategori Cabang Olahraga
          </label>
          <button
            type="button"
            onClick={handleEnableCustom}
            className={`text-[10px] transition-colors flex items-center gap-1 cursor-pointer font-semibold ${
              isCustomMode
                ? "text-[var(--color-cycling)] font-bold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>+ Cabang Kustom Baru</span>
          </button>
        </div>

        {/* Preset Sports Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {presetSports.map((item) => {
            const isSelected = !isCustomMode && sportType.toLowerCase() === item.id.toLowerCase();
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleSelectPreset(item.id)}
                className={`py-2 px-1.5 rounded-md text-center transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-surface-card)] border-[var(--color-cycling)] text-[var(--color-cycling)] font-bold shadow-xs"
                    : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]"
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="text-[10px] truncate w-full">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Sport Input Field */}
        {isCustomMode && (
          <div className="p-3 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-cycling)]/40 space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--color-cycling)] font-bold flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tambah &amp; Tetapkan Cabang Olahraga Baru
              </span>
              <span className="text-[var(--color-text-muted)]">Akan terdaftar otomatis di sistem</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                placeholder="Tuliskan cabang olahraga baru (contoh: Trail Run, Rowing, Padel)..."
                className="flex-1 px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] focus:border-[var(--color-cycling)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none"
                autoFocus
              />
              <span className="px-2.5 py-1 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] font-bold text-[10px] shrink-0 border border-[var(--color-cycling)]/30">
                {customInput.trim() || "Kustom"}
              </span>
            </div>
          </div>
        )}
      </div>

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
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
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
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] font-tabular"
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
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
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
              className="px-2 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] text-center focus:outline-none focus:border-[var(--color-cycling)]"
            />
            <input
              type="number"
              min="0"
              max="59"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="0m"
              className="px-2 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] text-center focus:outline-none focus:border-[var(--color-cycling)]"
              required
            />
            <input
              type="number"
              min="0"
              max="59"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="0s"
              className="px-2 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] text-center focus:outline-none focus:border-[var(--color-cycling)]"
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
            className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-tabular text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-running)]"
          />
        </div>
      </div>

      {/* Realtime Live Kinematics Strip */}
      <div className="p-3 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-between text-[11px]">
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
        <div className="text-[10px] text-[var(--color-text-muted)]">
          Kinematika Terkalkulasi
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold mb-1">
          Catatan / Deskripsi Sesi
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Rute jalan datar aspal, rasio gear ringan, hidrasi 500ml, cuaca teduh..."
          className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
        />
      </div>
    </div>
  );
}
