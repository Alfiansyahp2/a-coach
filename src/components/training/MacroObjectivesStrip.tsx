"use client";

import React from "react";
import { Bike, Footprints, Gauge } from "lucide-react";

export function MacroObjectivesStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
      {/* Road to 100km Century Ride */}
      <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#00F0FF] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-[#00F0FF]" />
            Road to 100 km Century
          </span>
          <span className="text-[#00F0FF] font-bold">56.1%</span>
        </div>
        <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
          <div className="h-full bg-[#00F0FF]" style={{ width: "56.1%" }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
          <span>Rekor Bebas Nyeri: <strong className="text-[#9BA3AF]">56.10 km</strong></span>
          <span>Target: <strong className="text-[#F0F2F5]">100 km MTB</strong></span>
        </div>
      </div>

      {/* Marathon Pathway */}
      <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#D4FF00] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-[#D4FF00]" />
            Jalur Maraton 10–20K
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30 font-bold">
            29.2%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
          <div className="h-full bg-[#D4FF00]" style={{ width: "29.2%" }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
          <span>Lari Dasar: <strong className="text-[#9BA3AF]">12.33 km</strong></span>
          <span>Tahap: <strong className="text-white">Return-to-Run</strong></span>
        </div>
      </div>

      {/* Weekly Minimum Mileage Target Progress */}
      <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#10B981] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#10B981]" />
            Intensitas Zone 2 (RPE 3–4)
          </span>
          <span className="text-[#10B981] font-bold">Talk Test</span>
        </div>
        <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
          <div className="h-full bg-[#10B981]" style={{ width: "100%" }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
          <span>Kayuhan: <strong className="text-white">Ringan & Stabil</strong></span>
          <span>Sensor: <strong className="text-[#9BA3AF]">Tanpa HRM</strong></span>
        </div>
      </div>

      {/* Fasting Routine Compliance */}
      <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] border-l-2 border-l-[#A855F7] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F0F2F5] flex items-center gap-1.5">
            <span className="text-xs">🌙</span>
            Jadwal Puasa Sunnah
          </span>
          <span className="text-[#D8B4FE] font-bold">100% Selaras</span>
        </div>
        <div className="w-full h-1.5 bg-[#090A0F] rounded-none overflow-hidden border border-[#1F2430]">
          <div className="h-full bg-[#A855F7]" style={{ width: "100%" }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#5A6272]">
          <span>Puasa: <strong className="text-[#D8B4FE]">Senin & Kamis</strong></span>
          <span>Latihan: <strong className="text-[#00F0FF]">Sel, Rab, Jum, Min</strong></span>
        </div>
      </div>
    </div>
  );
}

