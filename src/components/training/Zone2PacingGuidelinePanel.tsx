"use client";

import React from "react";
import { Compass } from "lucide-react";

export function Zone2PacingGuidelinePanel() {
  return (
    <div className="p-4 rounded-sm bg-[#12151D] border border-[#2D3547] font-mono space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-[#1F2430]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#D4FF00]" />
          <h2 className="text-xs uppercase font-bold text-[#F0F2F5]">
            Pedoman Pelatih: Parameter Latihan Zone 2 Tanpa Heart-Rate Monitor (MTB)
          </h2>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
          SOP LATIHAN RESMI
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
          <span className="text-[9px] uppercase font-bold text-[#D4FF00] block">Patokan Intensitas (RPE)</span>
          <p className="text-[#F0F2F5] font-bold text-xs">RPE 3–4 dari 10 (Easy/Zone 2)</p>
          <p className="text-[10px] text-[#9BA3AF] leading-tight">
            Beban relatif ringan. Pernapasan stabil terkendali. Jangan mengejar kecepatan di speedometer.
          </p>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
          <span className="text-[9px] uppercase font-bold text-[#00F0FF] block">Talk Test Kunci</span>
          <p className="text-[#F0F2F5] font-bold text-xs">Bisa Bicara Kalimat Lengkap</p>
          <p className="text-[10px] text-[#9BA3AF] leading-tight">
            Dapat mengobrol tanpa terputus-putus. Jika mulai terengah-engah, segera turunkan gigi dan kayuhan.
          </p>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
          <span className="text-[9px] uppercase font-bold text-[#FF9500] block">Teknis Sepeda MTB</span>
          <p className="text-[#F0F2F5] font-bold text-xs">Jalur Datar & Kayuhan Ringan</p>
          <p className="text-[10px] text-[#9BA3AF] leading-tight">
            Pilih gigi ringan dengan kadens stabil (85+ RPM). Hindari tanjakan bertorsi tinggi untuk melindungi sendi.
          </p>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1">
          <span className="text-[9px] uppercase font-bold text-[#A855F7] block">Proteksi Cedera & Puasa</span>
          <p className="text-[#F0F2F5] font-bold text-xs">Senin & Kamis Istirahat Penuh</p>
          <p className="text-[10px] text-[#9BA3AF] leading-tight">
            Ankle kanan & kedua lutut berstatus conditional. Hentikan latihan jika muncul rasa nyeri tajam atau bengkak.
          </p>
        </div>
      </div>
    </div>
  );
}

