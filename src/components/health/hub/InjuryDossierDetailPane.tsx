"use client";

import React from "react";
import { AthleteInjury } from "@/types";
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  Activity,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { AnatomicalRegionMeta } from "@/lib/anatomyUtils";

interface InjuryDossierDetailPaneProps {
  selectedInjury?: AthleteInjury;
  selectedMeta: AnatomicalRegionMeta;
  onOpenNewInjury?: (regionName: string) => void;
}

export function InjuryDossierDetailPane({
  selectedInjury,
  selectedMeta,
  onOpenNewInjury,
}: InjuryDossierDetailPaneProps) {
  if (selectedInjury) {
    return (
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
    );
  }

  // Asymptomatic
  return (
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
            className="px-3 py-1 rounded-lg bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30 text-[10.5px] font-bold hover:bg-[var(--color-alert-red)]/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
            className="text-[var(--color-alert-red)] hover:underline font-bold cursor-pointer"
          >
            Buka Form Input Gejala →
          </button>
        )}
      </div>
    </div>
  );
}
