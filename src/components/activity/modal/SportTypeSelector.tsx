"use client";

import React, { useState } from "react";
import { Bike, Footprints, Waves, Dumbbell, Compass, Activity as ActivityIcon, Plus, Tag } from "lucide-react";

interface SportTypeSelectorProps {
  sportType: string;
  setSportType: (v: string) => void;
}

export function SportTypeSelector({ sportType, setSportType }: SportTypeSelectorProps) {
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
    if (customInput.trim()) setSportType(customInput.trim());
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInput(val);
    setSportType(val.trim() || "Workout");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold">
          Kategori Cabang Olahraga
        </label>
        <button
          type="button"
          onClick={handleEnableCustom}
          className={`text-[10px] transition-colors flex items-center gap-1 cursor-pointer font-semibold ${
            isCustomMode ? "text-[var(--color-cycling)] font-bold" : "text-[var(--color-text-muted)] hover:text-[var(--color-cycling)]"
          }`}
        >
          <Plus className="w-3 h-3" />
          <span>+ Cabang Kustom Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {presetSports.map((item) => {
          const isSelected = !isCustomMode && sportType.toLowerCase() === item.id.toLowerCase();
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleSelectPreset(item.id)}
              className={`py-2 px-1.5 rounded-lg text-center transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isSelected
                  ? "bg-[var(--color-surface-card)] border-[var(--color-cycling)] text-[var(--color-cycling)] font-bold shadow-xs ring-1 ring-[var(--color-cycling)]/30"
                  : "bg-[var(--color-surface-muted)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span className="text-[10px] truncate w-full">{item.label}</span>
            </button>
          );
        })}
      </div>

      {isCustomMode && (
        <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-cycling)]/40 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[var(--color-cycling)] font-bold flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Tambah &amp; Tetapkan Cabang Olahraga Baru</span>
            </span>
            <span className="text-[var(--color-text-muted)]">Akan terdaftar otomatis di sistem</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              placeholder="Tuliskan cabang olahraga baru (contoh: Trail Run, Rowing, Padel)..."
              className="flex-1 px-3 py-1.5 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] focus:border-[var(--color-cycling)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none"
              autoFocus
            />
            <span className="px-2.5 py-1 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] font-bold text-[10px] shrink-0 border border-[var(--color-cycling)]/30">
              {customInput.trim() || "Kustom"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

