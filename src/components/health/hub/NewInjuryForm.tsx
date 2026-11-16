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
  AnatomicalZoneKey,
  AnatomicalRegionMeta,
  getAnatomicalRegion,
} from "@/lib/anatomyUtils";
import { AnatomicalRegionPicker } from "./injury-form/AnatomicalRegionPicker";
import { InjuryBiomechanicalBanner } from "./injury-form/InjuryBiomechanicalBanner";
import { InjuryDetailFields } from "./injury-form/InjuryDetailFields";

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
    <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-alert-red)]/40 space-y-4 font-mono text-xs shadow-xs animate-in fade-in duration-200">
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

      {/* 1. Interactive Anatomical Region Picker */}
      <AnatomicalRegionPicker
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        isCustomMode={isCustomMode}
        setIsCustomMode={setIsCustomMode}
        activeMeta={activeMeta}
        handleSelectRegion={handleSelectRegion}
        customRegionText={customRegionText}
        setCustomRegionText={setCustomRegionText}
      />

      {/* 2. Live Biomechanical Simulation Banner */}
      <InjuryBiomechanicalBanner
        activeMeta={activeMeta}
        handleApplyTemplate={handleApplyTemplate}
      />


      {/* 4. Form Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <InjuryDetailFields
          isCustomMode={isCustomMode}
          customRegionText={customRegionText}
          setCustomRegionText={setCustomRegionText}
          activeMeta={activeMeta}
          newSide={newSide}
          setNewSide={setNewSide}
          newSeverity={newSeverity}
          setNewSeverity={setNewSeverity}
          newMechanism={newMechanism}
          setNewMechanism={setNewMechanism}
          newTimeframe={newTimeframe}
          setNewTimeframe={setNewTimeframe}
          newLimitations={newLimitations}
          setNewLimitations={setNewLimitations}
          newSwelling={newSwelling}
          setNewSwelling={setNewSwelling}
        />


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
