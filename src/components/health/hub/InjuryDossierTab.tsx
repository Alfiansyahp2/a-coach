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
      <div className="lg:col-span-5 p-4 sm:p-4.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2430] text-xs">
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00F0FF]" />
            <span>Peta Anatomis Keseluruhan Tubuh</span>
          </span>
          <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-xs border border-[#00F0FF]/30 font-semibold">
            {injuries.length} Dossier Terpantau
          </span>
        </div>

        {/* Dynamic Full-Body Anatomical Zone Matrix */}
        <div className="space-y-2.5 text-xs max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
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
                  <div className="text-[10px] uppercase font-bold text-[#9BA3AF] flex items-center justify-between px-1">
                    <span>{zone.label}</span>
                    <span className="text-[9px] text-[#FF2A6D] font-bold">
                      {zoneInjuries.length} Titik Terpantau
                    </span>
                  </div>

                  {zoneInjuries.map((inj) => {
                    const isSelected =
                      selectedInjury?.id === inj.id ||
                      selectedBodyPart.toLowerCase() === inj.body_region.toLowerCase();
                    const meta = getAnatomicalRegion(inj.body_region);

                    return (
                      <button
                        key={inj.id}
                        type="button"
                        onClick={() => setSelectedBodyPart(inj.body_region)}
                        className={`w-full p-3 rounded-sm border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FF2A6D]/15 border-[#FF2A6D] text-white shadow-[0_0_12px_rgba(255,42,109,0.15)] ring-1 ring-[#FF2A6D]"
                            : "bg-[#161922] border-[#1F2430] text-[#F0F2F5] hover:border-[#FF2A6D]/60 hover:bg-[#1A1F2C]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#FF2A6D] animate-pulse" />
                            <span className="font-bold text-xs">
                              {inj.body_region} ({inj.side})
                            </span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold uppercase">
                            {inj.initial_severity === "SEVERE"
                              ? "Berat"
                              : inj.initial_severity === "MODERATE"
                              ? "Sedang"
                              : "Ringan"}
                          </span>
                        </div>

                        <div className="text-[10px] text-[#9BA3AF] mt-1.5 flex items-center gap-2">
                          <span className="text-[#10B981]">
                            🚲 {meta.cyclingImpactSeverity === "SAFE_FLAT" ? "Sepeda Flat Aman" : "Sepeda Kadens"}
                          </span>
                          <span className="text-[#2D3547]">•</span>
                          <span className="text-[#FF2A6D]">
                            🛑 {meta.isLowerExtremity ? "Lari Ditunda" : "Pantau Impak"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            }

            // Clean / Asymptomatic Zone Row
            const isZoneSelected =
              !selectedInjury &&
              selectedMeta.zoneKey === zone.key;

            return (
              <button
                key={zone.key}
                type="button"
                onClick={() => setSelectedBodyPart(zone.label)}
                className={`w-full p-2.5 rounded-sm border text-left transition-all flex items-center justify-between text-[#9BA3AF] ${
                  isZoneSelected
                    ? "bg-[#10B981]/15 border-[#10B981] text-white shadow-[0_0_10px_rgba(16,185,129,0.15)] ring-1 ring-[#10B981]"
                    : "bg-[#161922] border-[#1F2430] hover:border-[#2D3547] hover:text-[#F0F2F5]"
                }`}
              >
                <span className="flex items-center gap-2 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>{zone.label}</span>
                </span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#10B981]/15 text-[#10B981] font-bold">
                  BEBAS GEJALA
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-[10px] text-[#5A6272] border-t border-[#1F2430] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Klik salah satu area anatomi untuk menginspeksi dossier atau mendaftarkan riwayat baru.</span>
        </div>
      </div>

      {/* 2. Right Column: High-Density Dossier & Clinical Guidance Cards (7 cols) */}
      <div className="lg:col-span-7 p-4 sm:p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 shadow-sm">
        {selectedInjury ? (
          <div className="space-y-4">
            {/* Header: Area Name & Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1F2430]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#FF2A6D]/15 border border-[#FF2A6D]/40 flex items-center justify-center text-[#FF2A6D]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F0F2F5] uppercase tracking-wide">
                    {selectedInjury.body_region} ({selectedInjury.side})
                  </h3>
                  <span className="text-[10px] text-[#9BA3AF]">
                    {selectedMeta.clinicalTerm} • Evaluasi Klinis Berkala
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold uppercase">
                  {selectedInjury.medical_evaluation_status === "PENDING_CLINICAL_ASSESSMENT"
                    ? "Menunggu Asesmen Fisioterapi"
                    : selectedInjury.medical_evaluation_status}
                </span>
              </div>
            </div>

            {/* Dossier Structured Cards Grid */}
            <div className="grid grid-cols-1 gap-3 text-xs">
              {/* Card 1: Mekanisme & Kronologi */}
              <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#5A6272] uppercase font-bold">
                  <span className="flex items-center gap-1.5 text-[#00F0FF]">
                    <Clock className="w-3.5 h-3.5" />
                    Mekanisme Cedera &amp; Rentang Waktu
                  </span>
                  <span className="text-[#9BA3AF]">{selectedInjury.timeframe_description}</span>
                </div>
                <p className="text-[#F0F2F5] font-medium leading-relaxed">
                  {selectedInjury.injury_mechanism}
                </p>
              </div>

              {/* Card 2: Riwayat Gejala & Pembengkakan */}
              <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#5A6272] uppercase font-bold">
                  <span className="flex items-center gap-1.5 text-[#D4FF00]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Riwayat Pembengkakan &amp; Gejala Akut
                  </span>
                  <span
                    className={
                      selectedInjury.previous_swelling ? "text-[#FF2A6D] font-bold" : "text-[#10B981]"
                    }
                  >
                    {selectedInjury.previous_swelling ? "Pernah Terjadi Pembengkakan" : "Tanpa Edema Akut"}
                  </span>
                </div>
                <p className="text-[#F0F2F5] font-medium leading-relaxed">
                  {selectedInjury.previous_symptoms ||
                    "Tidak ada riwayat pembengkakan akut baru. Nyeri tumpul saat beban impak tinggi."}
                </p>
              </div>

              {/* Card 3: Kapasitas Fungsional Saat Ini */}
              <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#5A6272] uppercase font-bold">
                  <span className="flex items-center gap-1.5 text-[#10B981]">
                    <Activity className="w-3.5 h-3.5" />
                    Kapasitas Fungsional Saat Ini
                  </span>
                  <span className="text-[#00F0FF]">Toleransi Flat Jalan/Gowes</span>
                </div>
                <p className="text-[#F0F2F5] font-medium leading-relaxed">
                  {selectedInjury.functional_limitations}
                </p>
              </div>

              {/* Card 4: SOP Proteksi Latihan & Batasan Medis */}
              <div className="p-3.5 rounded-sm bg-gradient-to-r from-[#12151D] to-[#1A1622] border border-[#FF2A6D]/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#FF2A6D] uppercase font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  SOP Pelatih &amp; Instruksi Keselamatan Mandatoris:
                </div>
                <p className="text-[#F0F2F5] text-[11px] leading-relaxed italic">
                  "{selectedInjury.recovery_notes || selectedMeta.trainingGuidance.running}"
                </p>
              </div>

              {/* Card 5: Panduan Lintas Disiplin Biomekanis */}
              <div className="p-3.5 rounded-sm bg-[#161922] border border-[#00F0FF]/25 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[#00F0FF] font-bold block mb-1">
                    🚲 Protokol Bersepeda
                  </span>
                  <p className="text-[#9BA3AF]">{selectedMeta.trainingGuidance.cycling}</p>
                </div>
                <div>
                  <span className="text-[#D4FF00] font-bold block mb-1">
                    🥋 Protokol Cross-Training
                  </span>
                  <p className="text-[#9BA3AF]">{selectedMeta.trainingGuidance.crossTraining}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Clean / Asymptomatic Anatomical Area View */
          <div className="space-y-5 py-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F0F2F5] uppercase tracking-wide">
                    {selectedMeta.name}
                  </h3>
                  <span className="text-[10px] text-[#10B981] font-semibold">
                    Status: Bebas Gejala &amp; Stabil (Asymptomatic)
                  </span>
                </div>
              </div>

              {onOpenNewInjury && (
                <button
                  type="button"
                  onClick={() => onOpenNewInjury(selectedMeta.name)}
                  className="px-3 py-1 rounded-sm bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/40 text-[10.5px] font-bold hover:bg-[#FF2A6D]/25 transition-all flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Daftarkan Gejala di Area Ini</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-3 text-xs leading-relaxed text-[#9BA3AF]">
              <p>
                <strong className="text-[#F0F2F5]">Tidak Ada Catatan Cedera Aktif:</strong> Seluruh
                indikator telemetri pasca latihan dan rekam jejak klinis pada area{" "}
                <span className="text-[#00F0FF]">{selectedMeta.name}</span> berada dalam kondisi stabil
                tanpa edema, nyeri berdenyut, atau instabilitas sendi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1F2430]">
                <div className="p-3 bg-[#090A0F] rounded-xs border border-[#1F2430]">
                  <span className="text-[10px] text-[#00F0FF] uppercase font-bold block mb-1">
                    🏃 Kapasitas Lari
                  </span>
                  <span className="text-[11px] text-[#F0F2F5]">
                    {selectedMeta.isLowerExtremity
                      ? "Bebas impak saat ini; pertahankan kadens efisien."
                      : "Bebas beban gravitasi penuh."}
                  </span>
                </div>
                <div className="p-3 bg-[#090A0F] rounded-xs border border-[#1F2430]">
                  <span className="text-[10px] text-[#10B981] uppercase font-bold block mb-1">
                    🚲 Kapasitas Sepeda
                  </span>
                  <span className="text-[11px] text-[#F0F2F5]">
                    Kinematika rantai tertutup aman tanpa kontraindikasi beban.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[10.5px] text-[#5A6272] flex items-center justify-between">
              <span>Ingin mencatat sensasi nyeri atau ketegangan baru di area ini?</span>
              {onOpenNewInjury && (
                <button
                  type="button"
                  onClick={() => onOpenNewInjury(selectedMeta.name)}
                  className="text-[#FF2A6D] hover:underline font-bold"
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
