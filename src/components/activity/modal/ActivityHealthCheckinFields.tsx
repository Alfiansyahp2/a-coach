"use client";

import React from "react";
import { Gauge, ShieldCheck, HeartPulse, Activity } from "lucide-react";

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
    <div className="space-y-3.5 font-mono text-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#2b3a30]">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
          KONTROL KLINIS: INTENSITAS ZONE 2 &amp; STATUS SENDI
        </span>
        <span className="text-[10px] text-stone-400 font-semibold px-2 py-0.5 rounded bg-[#16211a] border border-[#2b3a30]">
          Pencegahan Cedera
        </span>
      </div>

      {/* RPE Selector (1 to 10) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1">
            <Gauge className="w-3 h-3 text-emerald-400" />
            <span>Skala Intensitas RPE (Borg CR10)</span>
          </label>
          <span className="text-[10px] font-bold text-emerald-400">
            Skor: {rpeScore} / 10{" "}
            {rpeScore <= 2
              ? "(Sangat Ringan / Recovery)"
              : rpeScore <= 4
              ? "(Zone 2 Aerobik • Talk Test Nyaman)"
              : rpeScore <= 6
              ? "(Moderat / Ambang Aerobik)"
              : "(Tinggi / Mendekati Anaerobik)"}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 font-tabular">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isZone2 = num === 3 || num === 4;
            const isSelected = rpeScore === num;

            return (
              <button
                type="button"
                key={num}
                onClick={() => setRpeScore(num)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
                    : isZone2
                    ? "bg-[#14231b] border-emerald-600/40 text-emerald-400 hover:bg-[#1a2f24]"
                    : "bg-[#121915] border-[#29382f] text-stone-400 hover:text-stone-200"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <p className="text-[9.5px] text-stone-400 leading-tight">
          Target fisiologis Zone 2: <strong className="text-emerald-400">RPE 3–4</strong>. Dapat berbicara dalam kalimat lengkap tanpa terengah-engah.
        </p>
      </div>

      {/* Joint Pain Scale (0-10) */}
      <div className="space-y-1.5 pt-2 border-t border-[#26352b]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-stone-400 uppercase font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-rose-400" />
            <span>Skala Nyeri Sendi (Engkel Kanan &amp; Kedua Lutut)</span>
          </label>
          <span
            className={`text-[10px] font-bold ${
              painScale === 0 ? "text-emerald-400" : painScale <= 3 ? "text-amber-400" : "text-rose-400"
            }`}
          >
            {painScale === 0
              ? "0 / 10 (Bebas Nyeri Sepenuhnya)"
              : `${painScale} / 10 (${painScale <= 3 ? "Nyeri Ringan Terkontrol" : "Nyeri Berarti / Wajib Istirahat"})`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="10"
            value={painScale}
            onChange={(e) => setPainScale(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <span
            className={`font-bold font-tabular text-sm w-7 text-right ${
              painScale === 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {painScale}
          </span>
        </div>
      </div>

      {/* Circuit Breakers: Swelling & Instability */}
      <div className="pt-2 border-t border-[#26352b] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#121915] border border-[#2b3a30] hover:border-emerald-600/40 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={swellingObserved}
            onChange={(e) => setSwellingObserved(e.target.checked)}
            className="w-4 h-4 accent-rose-500 rounded"
          />
          <span className="text-[11px] text-stone-300">
            Ada Pembengkakan Sendi?
          </span>
        </label>

        <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#121915] border border-[#2b3a30] hover:border-emerald-600/40 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={instabilityObserved}
            onChange={(e) => setInstabilityObserved(e.target.checked)}
            className="w-4 h-4 accent-rose-500 rounded"
          />
          <span className="text-[11px] text-stone-300">
            Ada Ketidakstabilan / Rasa Goyang?
          </span>
        </label>
      </div>
    </div>
  );
}
