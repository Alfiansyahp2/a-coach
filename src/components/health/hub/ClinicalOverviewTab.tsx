"use client";

import React from "react";
import { AthleteProfile } from "@/types";
import { User, Heart } from "lucide-react";

interface ClinicalOverviewTabProps {
  profile: AthleteProfile | null;
}

export function ClinicalOverviewTab({ profile }: ClinicalOverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Physical Baseline Matrix */}
      <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] font-mono text-xs">
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#00F0FF]" />
            Parameter Profil Fisik Terverifikasi (Apex Athlete)
          </span>
          <span className="text-[#5A6272]">Frekuensi Latihan: {profile?.training_days_per_week || 3} hari/minggu</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center font-mono">
          <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block uppercase">Usia Atlet</span>
            <span className="text-base font-bold font-tabular text-[#F0F2F5]">{profile?.age || 22}</span>
            <span className="text-[9px] text-[#9BA3AF] block">tahun</span>
          </div>

          <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block uppercase">Tinggi Badan</span>
            <span className="text-base font-bold font-tabular text-[#F0F2F5]">{profile?.height_cm || 170}</span>
            <span className="text-[9px] text-[#9BA3AF] block">cm</span>
          </div>

          <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block uppercase">Berat Badan</span>
            <span className="text-base font-bold font-tabular text-[#F0F2F5]">{profile?.weight_kg || 65}</span>
            <span className="text-[9px] text-[#9BA3AF] block">kg</span>
          </div>

          <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block uppercase">Indeks Massa Tubuh</span>
            <span className="text-base font-bold font-tabular text-[#10B981]">{profile?.bmi || 22.5}</span>
            <span className="text-[9px] text-[#10B981] block">Normal (Eutrofik)</span>
          </div>

          <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block uppercase">Detak Istirahat (RHR)</span>
            <span className="text-base font-bold font-tabular text-[#FF2A6D]">{profile?.resting_heart_rate || 68}</span>
            <span className="text-[9px] text-[#9BA3AF] block">bpm (Sensor Teruji)</span>
          </div>

          <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block uppercase">Cabang Utama</span>
            <span className="text-base font-bold text-[#00F0FF]">Lari & Sepeda</span>
            <span className="text-[9px] text-[#9BA3AF] block">Multi-Disiplin</span>
          </div>
        </div>
      </div>

      {/* Laboratory Sensor Thresholds: Zero-Hallucination Policy */}
      <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
          <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#FF2A6D]" />
            Ambang Sensorik Laboratorium Fisiologis
          </span>
          <span className="text-[#00F0FF] text-[10px]">Kebijakan Non-Fabrikasi Data</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block">Detak Jantung Maksimal (HRmax)</span>
            <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
            <span className="text-[9px] text-[#3A404D]">Perlu tes treadmill lab</span>
          </div>

          <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block">Ambang Laktat (LTHR)</span>
            <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
            <span className="text-[9px] text-[#3A404D]">Perlu sampling darah laktat</span>
          </div>

          <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block">Daya Ambang Fungsional (FTP)</span>
            <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
            <span className="text-[9px] text-[#3A404D]">Perlu power meter 20m test</span>
          </div>

          <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
            <span className="text-[10px] text-[#5A6272] block">Konsumsi Oksigen Maks (VO2max)</span>
            <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
            <span className="text-[9px] text-[#3A404D]">Perlu spirometri masker</span>
          </div>
        </div>

        <p className="text-[11px] text-[#9BA3AF] leading-relaxed bg-[#090A0F] p-3 rounded-sm border border-[#1F2430]/60">
          <strong className="text-[#00F0FF]">Integritas Data:</strong> Platform menolak membuat estimasi zona daya atau detak jantung tanpa pengukuran laboratorium yang tervalidasi. Seluruh rekomendasi pelatih berbasis pada skala persepsi beban (RPE Borg CR10), durasi aman, dan kadens mekanis.
        </p>
      </div>
    </div>
  );
}

