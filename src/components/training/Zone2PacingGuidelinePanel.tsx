"use client";

import React from "react";
import { Compass } from "lucide-react";

export function Zone2PacingGuidelinePanel() {
  return (
    <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] font-mono space-y-3.5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <h2 className="text-xs uppercase font-bold text-[var(--color-text-primary)] tracking-wide">
            Pedoman Pelatih: Parameter Latihan Zone 2 Tanpa Heart-Rate Monitor (MTB)
          </h2>
        </div>
        <span className="text-[9.5px] px-3 py-1 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold uppercase tracking-wider">
          SOP LATIHAN RESMI
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all space-y-1.5 shadow-xs">
          <span className="text-[9.5px] uppercase font-bold text-[var(--color-cycling)] block">Patokan Intensitas (RPE)</span>
          <p className="text-[var(--color-text-primary)] font-bold text-xs">RPE 3–4 dari 10 (Easy/Zone 2)</p>
          <p className="text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
            Beban relatif ringan. Pernapasan stabil terkendali. Jangan mengejar kecepatan di speedometer.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all space-y-1.5 shadow-xs">
          <span className="text-[9.5px] uppercase font-bold text-[var(--color-cycling)] block">Talk Test Kunci</span>
          <p className="text-[var(--color-text-primary)] font-bold text-xs">Bisa Bicara Kalimat Lengkap</p>
          <p className="text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
            Dapat mengobrol tanpa terputus-putus. Jika mulai terengah-engah, segera turunkan gigi dan kayuhan.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-running)] transition-all space-y-1.5 shadow-xs">
          <span className="text-[9.5px] uppercase font-bold text-[var(--color-running)] block">Teknis Sepeda MTB</span>
          <p className="text-[var(--color-text-primary)] font-bold text-xs">Jalur Datar &amp; Kayuhan Ringan</p>
          <p className="text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
            Pilih gigi ringan dengan kadens stabil (85+ RPM). Hindari tanjakan bertorsi tinggi untuk melindungi sendi.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-purple-500/40 transition-all space-y-1.5 shadow-xs">
          <span className="text-[9.5px] uppercase font-bold text-purple-600 dark:text-purple-400 block">Proteksi Cedera &amp; Puasa</span>
          <p className="text-[var(--color-text-primary)] font-bold text-xs">Senin &amp; Kamis Istirahat Penuh</p>
          <p className="text-[10.5px] text-[var(--color-text-secondary)] leading-relaxed">
            Ankle kanan &amp; kedua lutut berstatus conditional. Hentikan latihan jika muncul rasa nyeri tajam atau bengkak.
          </p>
        </div>
      </div>
    </div>
  );
}
