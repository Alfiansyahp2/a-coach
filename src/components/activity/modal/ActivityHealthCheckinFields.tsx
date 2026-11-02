"use client";

import React from "react";
import { Gauge, ShieldCheck, HeartPulse } from "lucide-react";

interface ActivityHealthCheckinFieldsProps {
  rpeScore: number;
  setRpeScore: (v: number) => void;
  painScale: number;
  setPainScale: (v: number) => void;
  swellingObserved: boolean;
  setSwellingObserved: (v: boolean) => void;
  instabilityObserved: boolean;
  setInstabilityObserved: (v: boolean) => void;
}

export function ActivityHealthCheckinFields({
  rpeScore,
  setRpeScore,
  painScale,
  setPainScale,
  swellingObserved,
  setSwellingObserved,
  instabilityObserved,
  setInstabilityObserved,
}: ActivityHealthCheckinFieldsProps) {
  return (
    <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3.5 font-mono text-xs">
      <div className="flex items-center justify-between pb-1 border-b border-[#1F2430]">
        <span className="text-xs font-bold text-[#F0F2F5] flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-[#10B981]" />
          CHECK-IN INTENSITAS ZONE 2 & STATUS KESEHATAN SENDI
        </span>
        <span className="text-[10px] text-[#5A6272]">Audit Klinis Sesi</span>
      </div>

      {/* RPE Selector (1 to 10) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-[#9BA3AF] uppercase flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[#D4FF00]" />
            <span>Skala Intensitas RPE (Borg CR10)</span>
          </label>
          <span className="text-[10px] font-bold text-[#D4FF00]">
            Skor Dipilih: {rpeScore} / 10{" "}
            {rpeScore <= 2
              ? "(Sangat Ringan / Recovery)"
              : rpeScore <= 4
              ? "(Zone 2 Aerobik • Talk Test Nyaman)"
              : rpeScore <= 6
              ? "(Moderat / Ambang Aerobik)"
              : "(Tinggi / Mendekati Anaerobik)"}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isZone2 = num === 3 || num === 4;
            const isSelected = rpeScore === num;

            return (
              <button
                type="button"
                key={num}
                onClick={() => setRpeScore(num)}
                className={`py-1.5 rounded-xs text-xs font-bold font-tabular transition-all border ${
                  isSelected
                    ? isZone2
                      ? "bg-[#D4FF00] text-black border-[#D4FF00] font-black shadow-md shadow-[#D4FF00]/10"
                      : "bg-[#00F0FF] text-black border-[#00F0FF] font-black"
                    : isZone2
                    ? "bg-[#161922] border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/10"
                    : "bg-[#090A0F] border-[#1F2430] text-[#9BA3AF] hover:text-white"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <p className="text-[9.5px] text-[#5A6272] leading-tight">
          Target program: <strong>RPE 3–4</strong>. Anda dapat berbicara dalam kalimat penuh tanpa terengah-engah sepanjang sesi.
        </p>
      </div>

      {/* Joint Pain Scale (0-10) */}
      <div className="space-y-1.5 pt-2 border-t border-[#1F2430]/70">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-[#9BA3AF] uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#FF2A6D]" />
            <span>Skala Nyeri Sendi (Engkel Kanan & Kedua Lutut)</span>
          </label>
          <span
            className={`text-[10px] font-bold ${
              painScale === 0 ? "text-[#10B981]" : painScale <= 3 ? "text-[#FF9500]" : "text-[#FF2A6D]"
            }`}
          >
            {painScale === 0
              ? "0 / 10 (Bebas Nyeri Sepenuhnya)"
              : `${painScale} / 10 (${painScale <= 3 ? "Nyeri Ringan Terkontrol" : "Nyeri Berarti / Perlu Istirahat"})`}
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
            <button
              type="button"
              key={val}
              onClick={() => setPainScale(val)}
              className={`py-1.5 rounded-xs text-xs font-bold font-tabular transition-all border ${
                painScale === val
                  ? val === 0
                    ? "bg-[#10B981] text-black border-[#10B981] font-black"
                    : "bg-[#FF2A6D] text-white border-[#FF2A6D] font-black"
                  : val === 0
                  ? "bg-[#161922] border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/10"
                  : "bg-[#090A0F] border-[#1F2430] text-[#9BA3AF] hover:text-white"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Swelling & Instability Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1F2430]/70">
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xs bg-[#090A0F] border border-[#1F2430]">
          <input
            type="checkbox"
            checked={swellingObserved}
            onChange={(e) => setSwellingObserved(e.target.checked)}
            className="accent-[#FF2A6D] rounded-none w-3.5 h-3.5"
          />
          <span className="text-[11px] text-[#9BA3AF]">
            Ada Pembengkakan Sendi Pasca Sesi?
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xs bg-[#090A0F] border border-[#1F2430]">
          <input
            type="checkbox"
            checked={instabilityObserved}
            onChange={(e) => setInstabilityObserved(e.target.checked)}
            className="accent-[#FF2A6D] rounded-none w-3.5 h-3.5"
          />
          <span className="text-[11px] text-[#9BA3AF]">
            Sendi Terasa Goyang / Tidak Stabil?
          </span>
        </label>
      </div>
    </div>
  );
}

