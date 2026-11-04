"use client";

import React, { useState } from "react";
import { AthleteInjury } from "@/types";
import {
  Layers,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  PlusCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  ANATOMICAL_ZONES,
  ANATOMICAL_REGIONS,
  getAnatomicalRegion,
  AnatomicalZoneKey,
  AnatomicalRegionMeta,
} from "@/lib/anatomyUtils";

interface InjuryDossierTabProps {
  injuries: AthleteInjury[];
  onOpenNewInjury?: (regionName: string) => void;
}

export function InjuryDossierTab({
  injuries,
  onOpenNewInjury,
}: InjuryDossierTabProps) {
  // Default selected body part to first tracked injury or Right Ankle
  const defaultPart = injuries[0]?.body_region || "Right Ankle";
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>(defaultPart);

  // Find if an injury matches the selected body part
  const selectedInjury = injuries.find(
    (i) =>
      i.body_region.toLowerCase() === selectedBodyPart.toLowerCase() ||
      selectedBodyPart.toLowerCase().includes(i.body_region.toLowerCase()) ||
      i.body_region.toLowerCase().includes(selectedBodyPart.toLowerCase())
  );

  const selectedMeta = getAnatomicalRegion(
    selectedInjury?.body_region || selectedBodyPart
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
      {/* 1. Left Column: Full-Body Anatomical Map & Vulnerability Matrix (5 cols) */}
      <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border)] text-xs">
          <span className="font-bold text-[var(--color-text-primary)] uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Peta Anatomis Keseluruhan Tubuh</span>
          </span>
          <span className="text-[9.5px] text-[var(--color-cycling)] bg-[var(--color-cycling)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-cycling)]/30 font-bold">
            {injuries.length} Dossier Terpantau
          </span>
        </div>

        {/* Dynamic Full-Body Anatomical Zone Matrix */}
        <div className="space-y-2.5 text-xs max-h-[640px] overflow-y-auto pr-1">
          {ANATOMICAL_ZONES.map((zone) => {
            // Find all recorded injuries matching this anatomical zone
            const zoneInjuries = injuries.filter((inj) => {
              const meta = getAnatomicalRegion(inj.body_region);
              return meta.zoneKey === zone.key;
            });

            const hasActiveInjuries = zoneInjuries.length > 0;

            if (hasActiveInjuries) {
              return (
                <div key={zone.key} className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center justify-between px-1">
                    <span>{zone.label}</span>
                    <span className="text-[9px] text-[var(--color-alert-red)] font-bold">
                      {zoneInjuries.length} Titik Terpantau
                    </span>
                  </div>

                  {zoneInjuries.map((inj) => {
                    const isSelected =
                      selectedInjury?.id === inj.id ||
                      selectedBodyPart.toLowerCase() === inj.body_region.toLowerCase();

                    return (
                      <button
                        key={inj.id}
                        type="button"
                        onClick={() => setSelectedBodyPart(inj.body_region)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between shadow-xs ${
                          isSelected
                            ? "bg-[var(--color-surface-muted)] border-[var(--color-alert-red)]"
                            : "bg-[var(--color-surface-muted)]/50 border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-text-secondary)]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-primary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-alert-red)] animate-pulse" />
                            <span>
                              {inj.body_region} ({inj.side})
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--color-text-muted)] block">
                            {inj.functional_limitations}
                          </span>
                        </div>

                        <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30 font-bold shrink-0 ml-2">
                          RESTRIKSI
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            }

            // Normal Asymptomatic Zones
            const isSelected = selectedBodyPart.toLowerCase() === zone.label.toLowerCase();
            return (
              <button
                key={zone.key}
                type="button"
                onClick={() => setSelectedBodyPart(zone.label)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-[var(--color-surface-muted)] border-[var(--color-cycling)]"
                    : "bg-[var(--color-surface-muted)]/30 border-[var(--color-border)]/60 hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                <span className="flex items-center gap-2 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cycling)]" />
                  <span>{zone.label}</span>
                </span>
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] font-bold">
                  BEBAS GEJALA
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-[10px] text-[var(--color-text-muted)] border-t border-[var(--color-border)] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Klik salah satu area anatomi untuk menginspeksi dossier atau mendaftarkan riwayat baru.</span>
        </div>
      </div>

      {/* 2. Right Column: High-Density Dossier & Clinical Guidance Cards (7 cols) */}
      <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4 shadow-xs">
        {selectedInjury ? (
          <div className="space-y-4">
            {/* Header: Area Name & Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-alert-red)]/30 flex items-center justify-center text-[var(--color-alert-red)] shadow-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    {selectedInjury.body_region} ({selectedInjury.side})
                  </h3>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {selectedMeta.clinicalTerm} • Evaluasi Klinis Berkala
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-[10px] font-bold uppercase shadow-xs">
                  {selectedInjury.medical_evaluation_status === "PENDING_CLINICAL_ASSESSMENT"
                    ? "Menunggu Asesmen Fisioterapi"
                    : selectedInjury.medical_evaluation_status}
                </span>
              </div>
            </div>

            {/* Dossier Structured Cards Grid */}
            <div className="grid grid-cols-1 gap-3 text-xs">
              {/* Card 1: Mekanisme & Kronologi */}
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
                  <span className="flex items-center gap-1.5 text-[var(--color-cycling)]">
                    <Clock className="w-3.5 h-3.5" />
                    Mekanisme Cedera &amp; Rentang Waktu
                  </span>
                  <span className="text-[var(--color-text-secondary)]">{selectedInjury.timeframe_description}</span>
                </div>
                <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
                  {selectedInjury.injury_mechanism}
                </p>
              </div>

              {/* Card 2: Riwayat Gejala & Pembengkakan */}
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
                  <span className="flex items-center gap-1.5 text-[var(--color-endurance)]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Riwayat Pembengkakan &amp; Gejala Akut
                  </span>
                  <span
                    className={
                      selectedInjury.previous_swelling ? "text-[var(--color-alert-red)] font-bold" : "text-[var(--color-cycling)] font-bold"
                    }
                  >
                    {selectedInjury.previous_swelling ? "Pernah Terjadi Pembengkakan" : "Tanpa Edema Akut"}
                  </span>
                </div>
                <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
                  {selectedInjury.previous_symptoms ||
                    "Tidak ada riwayat pembengkakan akut baru. Nyeri tumpul saat beban impak tinggi."}
                </p>
              </div>

              {/* Card 3: Kapasitas Fungsional Saat Ini */}
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] uppercase font-bold">
                  <span className="flex items-center gap-1.5 text-[var(--color-cycling)]">
                    <Activity className="w-3.5 h-3.5" />
                    Kapasitas Fungsional Saat Ini
                  </span>
                  <span className="text-[var(--color-cycling)] font-semibold">Toleransi Flat Jalan/Gowes</span>
                </div>
                <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
                  {selectedInjury.functional_limitations}
                </p>
              </div>

              {/* Card 4: SOP Proteksi Latihan & Batasan Medis */}
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-alert-red)]/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-alert-red)] uppercase font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  SOP Pelatih &amp; Instruksi Keselamatan Mandatoris:
                </div>
                <p className="text-[var(--color-text-primary)] text-[11px] leading-relaxed italic">
                  "{selectedInjury.recovery_notes || selectedMeta.trainingGuidance.running}"
                </p>
              </div>

              {/* Card 5: Panduan Lintas Disiplin Biomekanis */}
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                  <span className="text-[var(--color-cycling)] font-bold block mb-1">
                    🚲 Protokol Bersepeda
                  </span>
                  <p className="text-[var(--color-text-secondary)]">{selectedMeta.trainingGuidance.cycling}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                  <span className="text-[var(--color-endurance)] font-bold block mb-1">
                    🥋 Protokol Cross-Training
                  </span>
                  <p className="text-[var(--color-text-secondary)]">{selectedMeta.trainingGuidance.crossTraining}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Clean / Asymptomatic Anatomical Area View */
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    {selectedMeta.name}
                  </h3>
                  <span className="text-[10px] text-[var(--color-cycling)] font-semibold">
                    Status: Bebas Gejala &amp; Stabil (Asymptomatic)
                  </span>
                </div>
              </div>

              {onOpenNewInjury && (
                <button
                  type="button"
                  onClick={() => onOpenNewInjury(selectedMeta.name)}
                  className="px-3 py-1 rounded-lg bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30 text-[10.5px] font-bold hover:bg-[var(--color-alert-red)]/20 transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Daftarkan Gejala di Area Ini</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              <p>
                <strong className="text-[var(--color-text-primary)]">Tidak Ada Catatan Cedera Aktif:</strong> Seluruh
                indikator telemetri pasca latihan dan rekam jejak klinis pada area{" "}
                <span className="text-[var(--color-cycling)] font-semibold">{selectedMeta.name}</span> berada dalam kondisi stabil
                tanpa edema, nyeri berdenyut, atau instabilitas sendi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border)]">
                <div className="p-3 bg-[var(--color-surface-card)] rounded-lg border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-running)] uppercase font-bold block mb-1">
                    🏃 Kapasitas Lari
                  </span>
                  <span className="text-[11px] text-[var(--color-text-primary)]">
                    {selectedMeta.isLowerExtremity
                      ? "Bebas impak saat ini; pertahankan kadens efisien."
                      : "Bebas beban gravitasi penuh."}
                  </span>
                </div>
                <div className="p-3 bg-[var(--color-surface-card)] rounded-lg border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-cycling)] uppercase font-bold block mb-1">
                    🚲 Kapasitas Sepeda
                  </span>
                  <span className="text-[11px] text-[var(--color-text-primary)]">
                    Kinematika rantai tertutup aman tanpa kontraindikasi beban.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[10.5px] text-[var(--color-text-muted)] flex items-center justify-between">
              <span>Ingin mencatat sensasi nyeri atau ketegangan baru di area ini?</span>
              {onOpenNewInjury && (
                <button
                  type="button"
                  onClick={() => onOpenNewInjury(selectedMeta.name)}
                  className="text-[var(--color-alert-red)] hover:underline font-bold"
                >
                  Buka Form Input Gejala →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
