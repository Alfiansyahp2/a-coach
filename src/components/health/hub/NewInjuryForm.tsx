"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Info,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Compass,
} from "lucide-react";
import {
  ANATOMICAL_REGIONS,
  ANATOMICAL_ZONES,
  AnatomicalZoneKey,
  AnatomicalRegionMeta,
  getAnatomicalRegion,
} from "@/lib/anatomyUtils";

interface NewInjuryFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialRegionName?: string;
}

export function NewInjuryForm({
  onClose,
  onSuccess,
  initialRegionName,
}: NewInjuryFormProps) {
  // Initial resolution from initialRegionName or default to Right Ankle
  const initialMeta = getAnatomicalRegion(initialRegionName || "Right Ankle");

  const [selectedZone, setSelectedZone] = useState<AnatomicalZoneKey | "ALL">("ALL");
  const [selectedRegionId, setSelectedRegionId] = useState<string>(initialMeta.id);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customRegionText, setCustomRegionText] = useState<string>("");

  const activeMeta = isCustomMode
    ? getAnatomicalRegion(customRegionText || "Area Kustom")
    : ANATOMICAL_REGIONS.find((r) => r.id === selectedRegionId) || initialMeta;

  const [newSide, setNewSide] = useState<"LEFT" | "RIGHT" | "BILATERAL" | "AXIAL">(
    activeMeta.defaultSide
  );
  const [newSeverity, setNewSeverity] = useState<"MILD" | "MODERATE" | "SEVERE">("MODERATE");
  const [newMechanism, setNewMechanism] = useState<string>(activeMeta.suggestedMechanism);
  const [newTimeframe, setNewTimeframe] = useState<string>(activeMeta.suggestedTimeframe);
  const [newLimitations, setNewLimitations] = useState<string>(activeMeta.suggestedLimitations);
  const [newSwelling, setNewSwelling] = useState<boolean>(activeMeta.id === "ankle_atfl");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filtered anatomical regions based on zone pill
  const displayedRegions =
    selectedZone === "ALL"
      ? ANATOMICAL_REGIONS
      : ANATOMICAL_REGIONS.filter((r) => r.zoneKey === selectedZone);

  // Handle region selection from body map
  const handleSelectRegion = (meta: AnatomicalRegionMeta) => {
    setIsCustomMode(false);
    setSelectedRegionId(meta.id);
    setNewSide(meta.defaultSide);
    setNewMechanism(meta.suggestedMechanism);
    setNewTimeframe(meta.suggestedTimeframe);
    setNewLimitations(meta.suggestedLimitations);
    setNewSwelling(meta.id === "ankle_atfl");
  };

  const handleApplyTemplate = () => {
    setNewMechanism(activeMeta.suggestedMechanism);
    setNewTimeframe(activeMeta.suggestedTimeframe);
    setNewLimitations(activeMeta.suggestedLimitations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg(null);

    const bodyRegionValue = isCustomMode
      ? customRegionText.trim() || "Area Kustom"
      : activeMeta.name;

    try {
      const res = await fetch("/api/athlete/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body_region: bodyRegionValue,
          side: newSide,
          injury_mechanism: newMechanism.trim() || activeMeta.suggestedMechanism,
          timeframe_description: newTimeframe.trim() || activeMeta.suggestedTimeframe,
          previous_symptoms: `Gejala terlokalisasi pada ${activeMeta.clinicalTerm}`,
          initial_severity: newSeverity,
          previous_swelling: newSwelling,
          functional_limitations: newLimitations.trim() || activeMeta.suggestedLimitations,
          aggravating_activities: activeMeta.isLowerExtremity ? "Hentakan lari, lompatan plyometrik" : "Beban mekanis berlebih",
          easing_factors: "Gowes sepeda flat cadence tinggi, kompresi dingin, mobilitas",
          medical_evaluation_status: "PENDING_CLINICAL_ASSESSMENT",
          recovery_notes: activeMeta.trainingGuidance.running,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gagal menyimpan dossier cedera");
      }

      setFormMsg({
        type: "success",
        text: `Dossier ${bodyRegionValue} berhasil didaftarkan! Kesiapan latihan telah dikalibrasi ulang.`,
      });

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setFormMsg({
        type: "error",
        text: err.message || "Gagal menyimpan dossier cedera.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-alert-red)]/40 space-y-4 font-mono text-xs shadow-xs animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-alert-red)]/40 flex items-center justify-center text-[var(--color-alert-red)]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
              <span>Form Pendaftaran Gejala &amp; Riwayat Cedera Baru</span>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30 font-bold">
                Full Body Architecture
              </span>
            </h3>
            <span className="text-[10.5px] text-[var(--color-text-secondary)]">
              Pilih area anatomi tubuh secara interaktif untuk mengkalibrasi pembatasan olahraga secara deterministik.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          ✕
        </button>
      </div>

      {/* 1. Interactive Anatomical Zone Navigation Pills */}
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
      </div>

      {/* 2. Visual Anatomical Region Selector Grid (When not in custom mode) */}
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

      {/* 3. Live Biomechanical Simulation Banner */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--color-cycling)] font-bold uppercase">
              Area Terpilih: {activeMeta.name}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">({activeMeta.clinicalTerm})</span>
          </div>
          <button
            type="button"
            onClick={handleApplyTemplate}
            className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] text-[var(--color-cycling)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-colors flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3 text-[var(--color-cycling)]" />
            <span>Isi Ulang Templat Klinis</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[var(--color-border)]">
          <div className="flex items-start gap-1.5 text-[var(--color-text-secondary)]">
            <span className="font-bold text-[var(--color-alert-red)] shrink-0">🏃 Lari:</span>
            <span>{activeMeta.trainingGuidance.running}</span>
          </div>
          <div className="flex items-start gap-1.5 text-[var(--color-text-secondary)]">
            <span className="font-bold text-[var(--color-cycling)] shrink-0">🚲 Sepeda:</span>
            <span>{activeMeta.trainingGuidance.cycling}</span>
          </div>
        </div>
      </div>

      {/* 4. Form Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
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

        {formMsg && (
          <div
            className={`p-2.5 rounded-lg border text-[11px] font-semibold flex items-center gap-2 ${
              formMsg.type === "success"
                ? "bg-[var(--color-cycling)]/10 border-[var(--color-cycling)]/30 text-[var(--color-cycling)]"
                : "bg-[var(--color-alert-red)]/10 border-[var(--color-alert-red)]/30 text-[var(--color-alert-red)]"
            }`}
          >
            {formMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0" />
            )}
            <span>{formMsg.text}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Sistem akan mengunci overload lari secara otomatis jika terdaftar pada tungkai bawah.</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/40 font-bold hover:bg-[var(--color-alert-red)]/20 transition-all shadow-xs"
            >
              {isSubmitting ? "Menyimpan ke Rekam Medis..." : "Simpan Dossier Cedera"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
