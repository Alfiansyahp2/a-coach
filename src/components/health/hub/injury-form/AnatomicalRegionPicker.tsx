"use client";

import React from "react";
import { Layers } from "lucide-react";
import {
  ANATOMICAL_REGIONS,
  ANATOMICAL_ZONES,
  AnatomicalZoneKey,
  AnatomicalRegionMeta,
} from "@/lib/anatomyUtils";

interface AnatomicalRegionPickerProps {
  selectedZone: AnatomicalZoneKey | "ALL";
  setSelectedZone: (zone: AnatomicalZoneKey | "ALL") => void;
  isCustomMode: boolean;
  setIsCustomMode: (isCustom: boolean) => void;
  activeMeta: AnatomicalRegionMeta;
  handleSelectRegion: (meta: AnatomicalRegionMeta) => void;
  customRegionText: string;
  setCustomRegionText: (text: string) => void;
}

export function AnatomicalRegionPicker({
  selectedZone,
  setSelectedZone,
  isCustomMode,
  setIsCustomMode,
  activeMeta,
  handleSelectRegion,
  customRegionText,
  setCustomRegionText,
}: AnatomicalRegionPickerProps) {
  const displayedRegions =
    selectedZone === "ALL"
      ? ANATOMICAL_REGIONS
      : ANATOMICAL_REGIONS.filter((r) => r.zoneKey === selectedZone);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[var(--color-text-secondary)] uppercase font-bold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Langkah 1: Pilih Zona / Area Tubuh Atlet</span>
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {ANATOMICAL_REGIONS.length} Wilayah Anatomi Terkalibrasi
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setSelectedZone("ALL");
            setIsCustomMode(false);
          }}
          className={`px-3 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-all ${
            selectedZone === "ALL" && !isCustomMode
              ? "bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-cycling)] font-bold shadow-xs"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          🌐 Semua Tubuh ({ANATOMICAL_REGIONS.length})
        </button>
        {ANATOMICAL_ZONES.map((zone) => (
          <button
            key={zone.key}
            type="button"
            onClick={() => {
              setSelectedZone(zone.key);
              setIsCustomMode(false);
            }}
            className={`px-3 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-all ${
              selectedZone === zone.key && !isCustomMode
                ? "bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-cycling)] font-bold shadow-xs"
                : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {zone.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsCustomMode(true)}
          className={`px-3 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-all ${
            isCustomMode
              ? "bg-[var(--color-surface-muted)] text-[var(--color-endurance)] border border-[var(--color-endurance)] font-bold shadow-xs"
              : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-endurance)]"
          }`}
        >
          ✍️ Area Kustom...
        </button>
      </div>

      {!isCustomMode ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] rounded-xl">
          {displayedRegions.map((region) => {
            const isSelected = activeMeta.id === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleSelectRegion(region)}
                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1 group shadow-xs ${
                  isSelected
                    ? "bg-[var(--color-surface-card)] border-[var(--color-alert-red)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-alert-red)]"
                    : "bg-[var(--color-surface-card)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] font-bold truncate ${isSelected ? "text-[var(--color-alert-red)]" : "text-[var(--color-text-primary)]"}`}>
                    {region.name}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-alert-red)] animate-ping" />}
                </div>

                <div className="flex items-center justify-between text-[9px] text-[var(--color-text-muted)]">
                  <span>{region.zoneLabel}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md font-semibold ${
                      region.isLowerExtremity
                        ? "text-[var(--color-alert-red)] bg-[var(--color-alert-red)]/10"
                        : region.isAxial
                        ? "text-[var(--color-alert-amber)] bg-[var(--color-alert-amber)]/10"
                        : "text-[var(--color-cycling)] bg-[var(--color-cycling)]/10"
                    }`}
                  >
                    {region.isLowerExtremity ? "Hentakan Lari" : region.isAxial ? "Postur Spinal" : "Upper Body"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-endurance)]/40 rounded-xl space-y-2">
          <label className="block text-[10px] uppercase font-bold text-[var(--color-endurance)]">
            Ketikkan Area Anatomi Tubuh Kustom
          </label>
          <input
            type="text"
            value={customRegionText}
            onChange={(e) => setCustomRegionText(e.target.value)}
            placeholder="Contoh: Tulang Rusuk Kiri, Jari Manis Kaki, Trapezius Kanan"
            className="w-full bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-endurance)]"
            required={isCustomMode}
          />
          <p className="text-[10.5px] text-[var(--color-text-secondary)]">
            Sistem secara otomatis akan mengklasifikasikan kinematika gerak berdasarkan area kustom yang Anda masukkan.
          </p>
        </div>
      )}
    </div>
  );
}

