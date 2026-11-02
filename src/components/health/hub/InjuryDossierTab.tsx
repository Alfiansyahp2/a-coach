"use client";

import React, { useState } from "react";
import { AthleteInjury } from "@/types";
import { Layers } from "lucide-react";

interface InjuryDossierTabProps {
  injuries: AthleteInjury[];
}

export function InjuryDossierTab({ injuries }: InjuryDossierTabProps) {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("Right Ankle");

  const selectedInjury = injuries.find(
    (i) => i.body_region.toLowerCase() === selectedBodyPart.toLowerCase()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Interactive Anatomical Body Region Selector (5 cols) */}
      <div className="lg:col-span-5 p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#00F0FF]" />
            Peta Anatomis & Area Gejala
          </span>
          <span className="text-[10px] text-[#5A6272]">Klik untuk Inspeksi</span>
        </div>

        {/* Visual Anatomical Body Matrix */}
        <div className="space-y-2">
          <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-center text-xs text-[#5A6272]">
            Kepala & Leher (Bebas Gejala ✅)
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-[#5A6272]">
              Bahu Kiri (Aman)
            </div>
            <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-[#5A6272]">
              Bahu Kanan (Aman)
            </div>
          </div>

          <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-center text-xs text-[#5A6272]">
            Toraks & Tulang Belakang (Aman)
          </div>

          {/* Lower Extremity Focus Areas */}
          <button
            type="button"
            onClick={() => setSelectedBodyPart("Anterior Knees")}
            className={`w-full p-2.5 rounded-sm border text-left flex items-center justify-between transition-all ${
              selectedBodyPart.toLowerCase().includes("knee")
                ? "bg-[#FF2A6D]/15 border-[#FF2A6D] text-white shadow-sm"
                : "bg-[#161922] border-[#1F2430] text-[#9BA3AF] hover:border-[#FF2A6D]/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-none bg-[#FF2A6D]" />
              <span className="font-bold">Lutut Anterior (Bilateral Knees)</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#FF2A6D]/20 text-[#FF2A6D] font-bold">
              ON_HOLD
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedBodyPart("Right Ankle")}
            className={`w-full p-2.5 rounded-sm border text-left flex items-center justify-between transition-all ${
              selectedBodyPart.toLowerCase().includes("ankle")
                ? "bg-[#FF2A6D]/15 border-[#FF2A6D] text-white shadow-sm"
                : "bg-[#161922] border-[#1F2430] text-[#9BA3AF] hover:border-[#FF2A6D]/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-none bg-[#FF2A6D]" />
              <span className="font-bold">Engkel Kanan (Right Ankle)</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#FF2A6D]/20 text-[#FF2A6D] font-bold">
              ON_HOLD
            </span>
          </button>

          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] text-center text-xs text-[#5A6272]">
            Telapak Kaki & Plantar (Bebas Gejala)
          </div>
        </div>
      </div>

      {/* Dossier Detail for Selected Body Region (7 cols) */}
      <div className="lg:col-span-7 p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
        {selectedInjury ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-[#FF2A6D]" />
                <h3 className="text-sm font-bold text-[#F0F2F5] uppercase">
                  {selectedInjury.body_region} ({selectedInjury.side})
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-sm bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold">
                {selectedInjury.medical_evaluation_status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#9BA3AF]">
              <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Mekanisme Cedera & Waktu</span>
                <p className="text-[#F0F2F5] font-medium mt-0.5">{selectedInjury.injury_mechanism}</p>
                <span className="text-[10px] text-[#00F0FF] block mt-1">Rentang: {selectedInjury.timeframe_description}</span>
              </div>

              <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Riwayat Pembengkakan & Gejala</span>
                <p className="text-[#F0F2F5] font-medium mt-0.5">
                  {selectedInjury.previous_symptoms || "Tidak ada riwayat pembengkakan akut"}
                </p>
              </div>

              <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Kapasitas Fungsional Saat Ini</span>
                <p className="text-[#F0F2F5] font-medium mt-0.5">{selectedInjury.functional_limitations}</p>
              </div>

              <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[11px] space-y-1">
                <span className="text-[10px] text-[#FF2A6D] block uppercase font-bold">Catatan Klinis & Arahan Keselamatan:</span>
                <p className="text-[#9BA3AF] italic">{selectedInjury.recovery_notes}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#5A6272]">
            Pilih area tubuh di sebelah kiri untuk melihat rincian riwayat cedera.
          </div>
        )}
      </div>
    </div>
  );
}

