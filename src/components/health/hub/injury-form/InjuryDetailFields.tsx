"use client";

import React from "react";
import { AnatomicalRegionMeta } from "@/lib/anatomyUtils";

interface InjuryDetailFieldsProps {
  isCustomMode: boolean;
  customRegionText: string;
  setCustomRegionText: (v: string) => void;
  activeMeta: AnatomicalRegionMeta;
  newSide: "LEFT" | "RIGHT" | "BILATERAL" | "AXIAL";
  setNewSide: (v: "LEFT" | "RIGHT" | "BILATERAL" | "AXIAL") => void;
  newSeverity: "MILD" | "MODERATE" | "SEVERE";
  setNewSeverity: (v: "MILD" | "MODERATE" | "SEVERE") => void;
  newMechanism: string;
  setNewMechanism: (v: string) => void;
  newTimeframe: string;
  setNewTimeframe: (v: string) => void;
  newLimitations: string;
  setNewLimitations: (v: string) => void;
  newSwelling: boolean;
  setNewSwelling: (v: boolean) => void;
}

export function InjuryDetailFields({
  isCustomMode,
  customRegionText,
  setCustomRegionText,
  activeMeta,
  newSide,
  setNewSide,
  newSeverity,
  setNewSeverity,
  newMechanism,
  setNewMechanism,
  newTimeframe,
  setNewTimeframe,
  newLimitations,
  setNewLimitations,
  newSwelling,
  setNewSwelling,
}: InjuryDetailFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 uppercase font-bold">
            Area Tubuh (Body Region)
          </label>
          <input
            type="text"
            readOnly={!isCustomMode}
            value={isCustomMode ? customRegionText : activeMeta.name}
            onChange={(e) => setCustomRegionText(e.target.value)}
            className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] cursor-default"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 uppercase font-bold">
            Sisi Tubuh (Side)
          </label>
          <select
            value={newSide}
            onChange={(e: any) => setNewSide(e.target.value)}
            className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
          >
            {activeMeta.allowedSides.map((s) => (
              <option key={s} value={s}>
                {s === "RIGHT"
                  ? "Kanan (RIGHT)"
                  : s === "LEFT"
                  ? "Kiri (LEFT)"
                  : s === "BILATERAL"
                  ? "Kedua Sisi (BILATERAL)"
                  : "Punggung/Tengah (AXIAL)"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 uppercase font-bold">
            Tingkat Keparahan Awal
          </label>
          <select
            value={newSeverity}
            onChange={(e: any) => setNewSeverity(e.target.value)}
            className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
          >
            <option value="MILD">Ringan (MILD)</option>
            <option value="MODERATE">Sedang (MODERATE)</option>
            <option value="SEVERE">Berat (SEVERE)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 uppercase font-bold">
            Mekanisme Cedera / Pemicu Awal
          </label>
          <input
            type="text"
            value={newMechanism}
            onChange={(e) => setNewMechanism(e.target.value)}
            placeholder="Contoh: Salah tumpuan saat mendarat, rotasi mendadak"
            className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 uppercase font-bold">
            Rentang Waktu Terjadi
          </label>
          <input
            type="text"
            value={newTimeframe}
            onChange={(e) => setNewTimeframe(e.target.value)}
            placeholder="Contoh: 3-6 bulan lalu, 2 minggu terakhir"
            className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 uppercase font-bold">
            Keterbatasan Fungsional Saat Ini
          </label>
          <input
            type="text"
            value={newLimitations}
            onChange={(e) => setNewLimitations(e.target.value)}
            placeholder="Contoh: Nyeri saat hentakan lari, jalan normal, sepeda bebas nyeri"
            className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
          />
        </div>

        <div className="flex items-center gap-3 pt-5">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[var(--color-text-primary)] p-2 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-alert-red)]/40 w-full transition-colors">
            <input
              type="checkbox"
              checked={newSwelling}
              onChange={(e) => setNewSwelling(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-alert-red)]"
            />
            <span className="font-semibold">Pernah Mengalami Pembengkakan Sendi?</span>
            <span className="text-[9.5px] text-[var(--color-text-muted)] ml-auto">
              {newSwelling ? "Aktifkan Saklar Pengaman" : "Tanpa Pembengkakan"}
            </span>
          </label>
        </div>
      </div>
    </>
  );
}

