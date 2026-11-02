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
} from "lucide-react";

interface InjuryDossierTabProps {
  injuries: AthleteInjury[];
}

export function InjuryDossierTab({ injuries }: InjuryDossierTabProps) {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("Right Ankle");

  const selectedInjury = injuries.find(
    (i) => i.body_region.toLowerCase() === selectedBodyPart.toLowerCase()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
      {/* 1. Left Column: Interactive Anatomical Map & Vulnerability Matrix (5 cols) */}
      <div className="lg:col-span-5 p-4 sm:p-4.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2430] text-xs">
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00F0FF]" />
            Peta Anatomis &amp; Status Sendi
          </span>
          <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded-xs border border-[#00F0FF]/30 font-semibold">
            {injuries.length} Titik Terpantau
          </span>
        </div>

        {/* Anatomical Region Grid */}
        <div className="space-y-2 text-xs">
          {/* Upper Body (Clear) */}
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between text-[#9BA3AF]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Kepala, Leher &amp; Punggung Atas</span>
            </span>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#10B981]/15 text-[#10B981] font-bold">
              BEBAS GEJALA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[#9BA3AF]">
            <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Bahu Kiri
              </span>
              <span className="text-[9px] text-[#10B981] font-bold">OK</span>
            </div>
            <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Bahu Kanan
              </span>
              <span className="text-[9px] text-[#10B981] font-bold">OK</span>
            </div>
          </div>

          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between text-[#9BA3AF]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Toraks, Tulang Belakang &amp; Core</span>
            </span>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#10B981]/15 text-[#10B981] font-bold">
              STABIL
            </span>
          </div>

          {/* Active Vulnerability 1: Anterior Knees */}
          <button
            type="button"
            onClick={() => setSelectedBodyPart("Anterior Knees")}
            className={`w-full p-3 rounded-sm border text-left transition-all cursor-pointer ${
              selectedBodyPart.toLowerCase().includes("knee")
                ? "bg-[#FF2A6D]/15 border-[#FF2A6D] text-white shadow-[0_0_12px_rgba(255,42,109,0.15)] ring-1 ring-[#FF2A6D]"
                : "bg-[#161922] border-[#1F2430] text-[#F0F2F5] hover:border-[#FF2A6D]/60 hover:bg-[#1A1F2C]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FF2A6D] animate-pulse" />
                <span className="font-bold text-xs">Lutut Anterior (Bilateral Knees)</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold uppercase">
                Pantau Beban
              </span>
            </div>
            <div className="text-[10px] text-[#9BA3AF] mt-1.5 flex items-center gap-2">
              <span className="text-[#00F0FF]">🚲 Sepeda Kadens Tinggi</span>
              <span className="text-[#2D3547]">•</span>
              <span className="text-[#FF2A6D]">Hindari Tanjakan Curam</span>
            </div>
          </button>

          {/* Active Vulnerability 2: Right Ankle */}
          <button
            type="button"
            onClick={() => setSelectedBodyPart("Right Ankle")}
            className={`w-full p-3 rounded-sm border text-left transition-all cursor-pointer ${
              selectedBodyPart.toLowerCase().includes("ankle")
                ? "bg-[#FF2A6D]/15 border-[#FF2A6D] text-white shadow-[0_0_12px_rgba(255,42,109,0.15)] ring-1 ring-[#FF2A6D]"
                : "bg-[#161922] border-[#1F2430] text-[#F0F2F5] hover:border-[#FF2A6D]/60 hover:bg-[#1A1F2C]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FF2A6D] animate-pulse" />
                <span className="font-bold text-xs">Engkel Kanan (Right Ankle - ATFL)</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold uppercase">
                Lari Ditunda
              </span>
            </div>
            <div className="text-[10px] text-[#9BA3AF] mt-1.5 flex items-center gap-2">
              <span className="text-[#10B981]">🚲 Sepeda Flat Aman</span>
              <span className="text-[#2D3547]">•</span>
              <span className="text-[#FF2A6D]">🛑 Lari Dihentikan</span>
            </div>
          </button>

          {/* Feet & Plantar (Clear) */}
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-between text-[#9BA3AF]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Telapak Kaki, Tumit &amp; Plantar Fascia</span>
            </span>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#10B981]/15 text-[#10B981] font-bold">
              BEBAS GEJALA
            </span>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-[#5A6272] border-t border-[#1F2430] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Klik salah satu area sendi untuk menginspeksi dossier riwayat lengkap.</span>
        </div>
      </div>

      {/* 2. Right Column: High-Density Dossier Cards (7 cols) */}
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
                    Status Penanganan: Pemantauan Gejala Aktif
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
                  <span className="text-[#10B981]">Tanpa Edema Akut</span>
                </div>
                <p className="text-[#F0F2F5] font-medium leading-relaxed">
                  {selectedInjury.previous_symptoms || "Tidak ada riwayat pembengkakan akut baru. Nyeri tumpul saat beban impak tinggi."}
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
                  "{selectedInjury.recovery_notes}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-[#5A6272] flex flex-col items-center justify-center gap-2">
            <HelpCircle className="w-8 h-8 text-[#2D3547]" />
            <span>Pilih salah satu area sendi di sebelah kiri untuk melihat rincian riwayat cedera.</span>
          </div>
        )}
      </div>
    </div>
  );
}
