"use client";

import React from "react";
import { AuthoritativeAthleteHealthContext } from "@/types";
import { Stethoscope } from "lucide-react";
import { EditAthleteProfileModal } from "../EditAthleteProfileModal";

interface ClinicalAssessmentsTabProps {
  context: AuthoritativeAthleteHealthContext;
}

export function ClinicalAssessmentsTab({ context }: ClinicalAssessmentsTabProps) {
  return (
    <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
        <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-[#00F0FF]" />
          Catatan Penilaian Klinis & Kriteria Return-to-Sport
        </span>
        <span className="text-[#FF2A6D] text-[10px]">Menunggu Jadwal Fisioterapi</span>
      </div>

      <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#F0F2F5]">Status Penilaian Fisioterapi Saat Ini:</span>
          <span className="px-2 py-0.5 rounded-sm bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[10px]">
            PENDING_CLINICAL_ASSESSMENT
          </span>
        </div>

        <p className="text-[11px] text-[#9BA3AF] leading-relaxed pt-1">
          Atlet belum menjalani penilaian formal oleh fisioterapis olahraga atau dokter spesialis ortopedi untuk mengevaluasi integritas ligamen engkel (<em>anterior talofibular ligament / calcaneofibular ligament</em>) serta melacak penyebab pasti nyeri lutut anterior bilateral.
        </p>

        <div className="p-3 bg-[#090A0F] rounded-sm border border-[#1F2430] text-[11px] text-[#9BA3AF] space-y-1 mt-2">
          <span className="font-bold text-[#00F0FF] block uppercase">Kriteria Kembali Berlari (Return-to-Run Criteria):</span>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>Bebas nyeri penuh saat jalan kaki cepat dan naik-turun tangga tanpa kompensasi gaya berjalan.</li>
            <li>Mampu melakukan 25x single-leg calf raises tanpa nyeri atau ketidakstabilan.</li>
            <li>Mampu melakukan 30 detik single-leg balance dengan mata tertutup.</li>
            <li>Izin tertulis atau persetujuan lisan dari tenaga medis terlisensi.</li>
          </ul>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[10px] text-[#5A6272]">
            Catat evaluasi atau tindakan fisioterapi terbaru:
          </span>
          <EditAthleteProfileModal
            variant="button"
            profile={context.profile}
            healthContext={context}
          />
        </div>
      </div>
    </div>
  );
}

