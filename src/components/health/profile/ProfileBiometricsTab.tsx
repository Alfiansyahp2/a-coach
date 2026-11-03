"use client";

import React from "react";
import { Heart, Calendar } from "lucide-react";

interface ProfileBiometricsTabProps {
  name: string;
  setName: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  restingHr: string;
  setRestingHr: (v: string) => void;
  heightCm: string;
  setHeightCm: (v: string) => void;
  weightKg: string;
  setWeightKg: (v: string) => void;
  calculatedBmi: string;
  trainingDays: number;
  setTrainingDays: (v: number) => void;
}

export function ProfileBiometricsTab({
  name,
  setName,
  age,
  setAge,
  restingHr,
  setRestingHr,
  heightCm,
  setHeightCm,
  weightKg,
  setWeightKg,
  calculatedBmi,
  trainingDays,
  setTrainingDays,
}: ProfileBiometricsTabProps) {
  const bmiNum = parseFloat(calculatedBmi);

  return (
    <div className="space-y-3.5 font-mono">
      {/* Athlete Name & Age */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1">
            Nama Atlet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Atlet"
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1">
            Usia (Tahun)
          </label>
          <input
            type="number"
            min="12"
            max="90"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
        </div>
      </div>

      {/* Biometric Triad: RHR, Height, Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Resting Heart Rate */}
        <div>
          <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#FF2A6D]">
              <Heart className="w-3 h-3 fill-[#FF2A6D]/20" />
              <span>Resting HR</span>
            </span>
            <span className="text-[10px] text-[#5A6272]">bpm</span>
          </label>
          <input
            type="number"
            min="35"
            max="120"
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value)}
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#FF2A6D]"
            required
          />
          <span className="text-[9px] text-[#5A6272] mt-0.5 block">
            Detak jantung bangun pagi
          </span>
        </div>

        {/* Height */}
        <div>
          <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
            <span className="text-[#00F0FF]">Tinggi Badan</span>
            <span className="text-[10px] text-[#5A6272]">cm</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="100"
            max="240"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
            required
          />
          <span className="text-[9px] text-[#5A6272] mt-0.5 block">
            Postur tubuh atlet
          </span>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
            <span className="text-[#D4FF00]">Berat Badan</span>
            <span className="text-[10px] text-[#5A6272]">kg</span>
          </label>
          <input
            type="number"
            step="0.5"
            min="30"
            max="200"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#D4FF00]"
            required
          />
          <span className="text-[9px] text-[#5A6272] mt-0.5 block">
            Bobot aktif saat ini
          </span>
        </div>
      </div>

      {/* Live Dynamic BMI Banner */}
      <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#5A6272] uppercase block">
            Body Mass Index (BMI) Terhitung
          </span>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-xl font-bold font-tabular text-[#10B981]">
              {calculatedBmi}
            </span>
            <span className="text-xs text-[#9BA3AF]">
              kg/m²
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="px-2.5 py-1 rounded-xs bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold">
            {bmiNum < 18.5
              ? "Kategori: Berat Kurang"
              : bmiNum <= 24.9
              ? "Kategori: Normal / Ideal"
              : "Kategori: Kelebihan Bobot"}
          </span>
        </div>
      </div>

      {/* Training Days Availability */}
      <div className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-2">
        <label className="text-xs font-bold text-[#F0F2F5] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
          KETERSEDIAAN HARI LATIHAN MINGGUAN
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[2, 3, 4, 5].map((days) => (
            <button
              type="button"
              key={days}
              onClick={() => setTrainingDays(days)}
              className={`py-2 rounded-sm text-xs font-bold transition-colors ${
                trainingDays === days
                  ? "bg-[#00F0FF] text-black font-extrabold shadow-sm"
                  : "bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-white"
              }`}
            >
              {days} Sesi / Minggu
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#9BA3AF] leading-relaxed pt-1">
          Program 12-Minggu diselaraskan untuk 3 sesi utama: <strong>Selasa</strong> (Easy), <strong>Jumat</strong> (Recovery), dan <strong>Minggu</strong> (Long Endurance). Senin & Kamis tetap dialokasikan istirahat penuh untuk puasa sunnah.
        </p>
      </div>
    </div>
  );
}

