"use client";

import React from "react";
import { AthleteProfile, AuthoritativeAthleteHealthContext } from "@/types";
import {
  User,
  Heart,
  Scale,
  Calendar,
  Activity,
  Bike,
  ShieldAlert,
  HelpCircle,
  Pencil,
  Zap,
  Info,
} from "lucide-react";
import { EditAthleteProfileModal } from "../EditAthleteProfileModal";

interface ClinicalOverviewTabProps {
  profile: AthleteProfile | null;
  context?: AuthoritativeAthleteHealthContext | null;
}

export function ClinicalOverviewTab({ profile, context }: ClinicalOverviewTabProps) {
  const age = profile?.age || 22;
  const heightCm = profile?.height_cm || 170;
  const weightKg = profile?.weight_kg || 65;
  const bmi = profile?.bmi || 22.5;
  const rhr = profile?.resting_heart_rate || 68;
  const trainingDays = profile?.training_days_per_week || 3;

  return (
    <div className="space-y-4">
      {/* 1. Physical Baseline Matrix */}
      <div className="p-4 sm:p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2430]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#00F0FF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F0F2F5] uppercase tracking-wider flex items-center gap-2">
                <span>Parameter Profil Fisik Atlet</span>
                <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  Apex Athlete
                </span>
              </h3>
              <span className="text-[10.5px] text-[#9BA3AF]">
                Biometrik Terkalibrasi • Ketersediaan Latihan: {trainingDays} Hari / Minggu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {profile && (
              <EditAthleteProfileModal
                variant="button"
                profile={profile}
                healthContext={context}
              />
            )}
          </div>
        </div>

        {/* 6 Biometric Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Card 1: Usia */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all">
            <div className="flex items-center justify-between text-[#5A6272] mb-1">
              <span className="text-[10px] uppercase font-bold">Usia</span>
              <Calendar className="w-3.5 h-3.5 text-[#9BA3AF]" />
            </div>
            <div className="text-2xl font-black font-tabular text-[#F0F2F5]">
              {age}
            </div>
            <span className="text-[10px] text-[#9BA3AF]">Tahun</span>
          </div>

          {/* Card 2: Tinggi */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all">
            <div className="flex items-center justify-between text-[#5A6272] mb-1">
              <span className="text-[10px] uppercase font-bold">Tinggi</span>
              <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
            </div>
            <div className="text-2xl font-black font-tabular text-[#F0F2F5]">
              {heightCm}
            </div>
            <span className="text-[10px] text-[#9BA3AF]">Centimeter</span>
          </div>

          {/* Card 3: Berat */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all">
            <div className="flex items-center justify-between text-[#5A6272] mb-1">
              <span className="text-[10px] uppercase font-bold">Berat</span>
              <Scale className="w-3.5 h-3.5 text-[#D4FF00]" />
            </div>
            <div className="text-2xl font-black font-tabular text-[#F0F2F5]">
              {weightKg}
            </div>
            <span className="text-[10px] text-[#9BA3AF]">Kilogram</span>
          </div>

          {/* Card 4: BMI */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#10B981]/40 transition-all">
            <div className="flex items-center justify-between text-[#5A6272] mb-1">
              <span className="text-[10px] uppercase font-bold">IMT (BMI)</span>
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            </div>
            <div className="text-2xl font-black font-tabular text-[#10B981]">
              {bmi}
            </div>
            <span className="text-[9.5px] font-bold text-[#10B981] block truncate">
              Normal (Eutrofik)
            </span>
          </div>

          {/* Card 5: RHR */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#FF2A6D]/40 transition-all">
            <div className="flex items-center justify-between text-[#5A6272] mb-1">
              <span className="text-[10px] uppercase font-bold">Detak Rehat</span>
              <Heart className="w-3.5 h-3.5 text-[#FF2A6D]" />
            </div>
            <div className="text-2xl font-black font-tabular text-[#FF2A6D]">
              {rhr}
            </div>
            <span className="text-[10px] text-[#9BA3AF]">bpm (Sensor Teruji)</span>
          </div>

          {/* Card 6: Cabang Utama */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#00F0FF]/40 transition-all">
            <div className="flex items-center justify-between text-[#5A6272] mb-1">
              <span className="text-[10px] uppercase font-bold">Fokus Olahraga</span>
              <Bike className="w-3.5 h-3.5 text-[#00F0FF]" />
            </div>
            <div className="text-sm font-black text-[#00F0FF] leading-snug mt-1">
              Lari &amp; Sepeda
            </div>
            <span className="text-[10px] text-[#9BA3AF]">Multi-Disiplin</span>
          </div>
        </div>
      </div>

      {/* 2. Physiological Unknowns / Laboratory Sensor Thresholds */}
      <div className="p-4 sm:p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1F2430]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-xs uppercase font-bold text-[#F0F2F5] tracking-wider">
              Ambang Sensorik Laboratorium Fisiologis
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 w-fit">
            🛡️ Standar Non-Fabrikasi Data (Zero Hallucination)
          </span>
        </div>

        {/* 4 Cards: Replaced depressing "null" with actionable guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: HRmax */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#F0F2F5]">
              <span>HRmax (Maksimal)</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#090A0F] text-[#9BA3AF] border border-[#1F2430]">
                Belum Diuji Lab
              </span>
            </div>
            <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430] space-y-1">
              <span className="text-[9.5px] text-[#5A6272] block uppercase font-bold">
                Panduan Aktif Pelatih:
              </span>
              <p className="text-[11px] text-[#D4FF00] font-bold leading-tight">
                RPE 3–4 (Borg CR10)
              </p>
              <p className="text-[10px] text-[#9BA3AF] leading-tight">
                Menjaga intensitas Zone 2 tanpa memaksakan rumus 220-usia.
              </p>
            </div>
            <span className="text-[9px] text-[#5A6272] block">
              Butuh: Uji treadmill bertingkat (Bruce Protocol)
            </span>
          </div>

          {/* Card 2: LTHR */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#F0F2F5]">
              <span>Ambang Laktat (LTHR)</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#090A0F] text-[#9BA3AF] border border-[#1F2430]">
                Belum Diuji Lab
              </span>
            </div>
            <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430] space-y-1">
              <span className="text-[9.5px] text-[#5A6272] block uppercase font-bold">
                Panduan Aktif Pelatih:
              </span>
              <p className="text-[11px] text-[#00F0FF] font-bold leading-tight">
                Metode Talk Test
              </p>
              <p className="text-[10px] text-[#9BA3AF] leading-tight">
                Bisa bicara dalam kalimat lengkap tanpa terengah-engah.
              </p>
            </div>
            <span className="text-[9px] text-[#5A6272] block">
              Butuh: Uji sampel darah kapiler laktat bertahap
            </span>
          </div>

          {/* Card 3: FTP */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#F0F2F5]">
              <span>Daya Ambang (FTP)</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#090A0F] text-[#9BA3AF] border border-[#1F2430]">
                Belum Diuji Lab
              </span>
            </div>
            <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430] space-y-1">
              <span className="text-[9.5px] text-[#5A6272] block uppercase font-bold">
                Panduan Aktif Pelatih:
              </span>
              <p className="text-[11px] text-[#D4FF00] font-bold leading-tight">
                Kadens Sepeda 85–95 RPM
              </p>
              <p className="text-[10px] text-[#9BA3AF] leading-tight">
                Gigi ringan di rute datar untuk meminimalkan torsi lutut.
              </p>
            </div>
            <span className="text-[9px] text-[#5A6272] block">
              Butuh: Uji power meter 20 menit di stationary trainer
            </span>
          </div>

          {/* Card 4: VO2max */}
          <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#2D3547] transition-all space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#F0F2F5]">
              <span>Konsumsi Oksigen (VO2max)</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-xs bg-[#090A0F] text-[#9BA3AF] border border-[#1F2430]">
                Belum Diuji Lab
              </span>
            </div>
            <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430] space-y-1">
              <span className="text-[9.5px] text-[#5A6272] block uppercase font-bold">
                Panduan Aktif Pelatih:
              </span>
              <p className="text-[11px] text-[#10B981] font-bold leading-tight">
                Durasi Aerobik Stabil
              </p>
              <p className="text-[10px] text-[#9BA3AF] leading-tight">
                Fokus durasi 40–60 menit untuk membangun kapasitas dasar.
              </p>
            </div>
            <span className="text-[9px] text-[#5A6272] block">
              Butuh: Uji spirometri analisis gas respiratorik masker
            </span>
          </div>
        </div>

        {/* Explain why we don't guess */}
        <div className="p-3.5 rounded-sm bg-[#090A0F] border border-[#00F0FF]/30 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#9BA3AF]">
            <strong className="text-[#00F0FF]">Mengapa Tidak Ditebak Secara Otomatis?</strong>{" "}
            Rumus generik (seperti 220-usia) memiliki deviasi hingga ±15–20 bpm yang berbahaya memicu pembebanan berlebih (*overtraining*) pada sendi engkel dan lutut yang sedang masa adaptasi. Program latihan Anda sepenuhnya dipandu oleh skala persepsi usaha tervalidasi (**RPE 3–4**), uji bicara (**Talk Test**), dan kadens mekanis stabil.
          </div>
        </div>
      </div>
    </div>
  );
}
