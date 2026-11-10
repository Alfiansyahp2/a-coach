"use client";

import React from "react";
import {
  Footprints,
  Bike,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface AthleteHealthDirectivesProps {
  activeTab: "overview" | "directives" | "risks";
}

export function AthleteHealthDirectives({ activeTab }: AthleteHealthDirectivesProps) {
  if (activeTab === "overview") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: RUNNING CAPACITY GAUGE */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col justify-between space-y-3.5">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2.5">
              <span className="text-[var(--color-text-primary)] font-bold flex items-center gap-2 uppercase tracking-wider">
                <Footprints className="w-4 h-4 text-[var(--color-alert-red)]" />
                Beban Hentakan Lari (Impact Load)
              </span>
              <span className="px-2.5 py-0.5 text-[9.5px] font-mono font-bold rounded-full bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30">
                0% • ON_HOLD
              </span>
            </div>

            {/* Capacity Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[var(--color-text-secondary)]">Toleransi Benturan Sendi:</span>
                <span className="text-[var(--color-alert-red)] font-bold font-tabular">0.0 km / Maks 0.0 km</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-alert-red)] w-0" />
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-muted)] block font-medium">Jarak Maksimum</span>
                <span className="text-lg font-black font-tabular text-[var(--color-alert-red)]">0 km</span>
                <span className="text-[10px] text-[var(--color-text-secondary)] block pt-0.5">Benturan dilarang</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-muted)] block font-medium">Fokus Latihan</span>
                <span className="text-lg font-black font-tabular text-[var(--color-text-primary)]">Mobilitas</span>
                <span className="text-[10px] text-[var(--color-text-secondary)] block pt-0.5">Isometrik non-impact</span>
              </div>
            </div>

            <p className="text-xs font-mono text-[var(--color-text-secondary)] mt-3 leading-relaxed bg-[var(--color-surface-card)] p-3 rounded-lg border border-[var(--color-border)]">
              <strong className="text-[var(--color-alert-red)]">Alasan Pembatasan:</strong> Beban hentakan lari (2.5–3x berat badan per langkah) membebani ligamen engkel kanan yang sedang pulih dan memicu rasa pegal di tempurung kedua lutut.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--color-alert-red)] font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Progresi Volume Dikunci
            </span>
            <span className="text-[var(--color-cycling)] font-medium">Menunggu Evaluasi Fisioterapi</span>
          </div>
        </div>

        {/* RIGHT: CYCLING CAPACITY GAUGE */}
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col justify-between space-y-3.5">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2.5">
              <span className="text-[var(--color-text-primary)] font-bold flex items-center gap-2 uppercase tracking-wider">
                <Bike className="w-4 h-4 text-[var(--color-cycling)]" />
                Beban Kayuhan Sepeda (Non-Impact)
              </span>
              <span className="px-2.5 py-0.5 text-[9.5px] font-mono font-bold rounded-full bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30">
                60% • CONDITIONAL
              </span>
            </div>

            {/* Capacity Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[var(--color-text-secondary)]">Toleransi Jarak Aman / Sesi:</span>
                <span className="text-[var(--color-cycling)] font-bold font-tabular">Hingga 30.0 km</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-cycling)] w-[60%] transition-all duration-500" />
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-muted)] block font-medium">Batas Sesi / Rute</span>
                <span className="text-lg font-black font-tabular text-[var(--color-cycling)]">≤ 30 km</span>
                <span className="text-[10px] text-[var(--color-text-secondary)] block pt-0.5">Rute datar (flat terrain)</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-muted)] block font-medium">Kadens Disarankan</span>
                <span className="text-lg font-black font-tabular text-[var(--color-endurance)]">85–95 RPM</span>
                <span className="text-[10px] text-[var(--color-text-secondary)] block pt-0.5">Zone 2 (Torsi Rendah)</span>
              </div>
            </div>

            <p className="text-xs font-mono text-[var(--color-text-secondary)] mt-3 leading-relaxed bg-[var(--color-surface-card)] p-3 rounded-lg border border-[var(--color-border)]">
              <strong className="text-[var(--color-cycling)]">Toleransi Empiris Terverifikasi:</strong> Sesi sepeda 56.10 km tuntas dengan skor nyeri 0/10 dan tanpa pembengkakan sendi. Sangat aman menjaga daya tahan aerobik dengan kayuhan ringan.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--color-cycling)] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              56.10 km: Bebas Nyeri &amp; Bengkak
            </span>
            <span className="text-[var(--color-text-secondary)] font-medium">Hindari Tanjakan Berdiri / Sprint</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "directives") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
        {/* Authorized Directives */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-cycling)]/30 space-y-3">
          <span className="text-xs font-bold text-[var(--color-cycling)] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <CheckCircle2 className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Aktivitas Diizinkan &amp; Disarankan:</span>
          </span>
          <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-cycling)] font-bold text-sm leading-none">•</span>
              <span><strong>Gowes Aerobik Zone 2:</strong> 30–50 menit rute datar, kadens stabil 85–95 RPM, RPE 3–4 (bisa mengobrol nyaman).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-cycling)] font-bold text-sm leading-none">•</span>
              <span><strong>Penguatan Isometrik:</strong> Calf raises lambat tanpa hentakan, penguatan tibialis anterior, dan quad isometric sets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-cycling)] font-bold text-sm leading-none">•</span>
              <span><strong>Mobilitas Pasif:</strong> Dorsofleksi pergelangan kaki dan peregangan hamstring/betis pasca latihan.</span>
            </li>
          </ul>
        </div>

        {/* Blocked Directives */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-alert-red)]/30 space-y-3">
          <span className="text-xs font-bold text-[var(--color-alert-red)] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <XCircle className="w-4 h-4 text-[var(--color-alert-red)]" />
            <span>Aktivitas Dilarang (Kontraindikasi):</span>
          </span>
          <ul className="space-y-2.5 text-xs text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-alert-red)] font-bold text-sm leading-none">•</span>
              <span><strong>Sesi Lari Apapun:</strong> Lari jalan raya, treadmill, maupun jogging pemanasan (risiko benturan sendi tinggi).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-alert-red)] font-bold text-sm leading-none">•</span>
              <span><strong>Gowes Tanjakan Berdiri:</strong> Hindari tanjakan terjal dengan gigi berat yang memicu torsi tinggi pada tempurung lutut.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-alert-red)] font-bold text-sm leading-none">•</span>
              <span><strong>Plyometrics &amp; Lompatan:</strong> Aktivitas dengan pendaratan tidak stabil seperti lompat tali atau olahraga raket/bola.</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // activeTab === "risks"
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-center">
      <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-alert-red)]/30 space-y-1.5">
        <span className="text-[10px] text-[var(--color-text-muted)] uppercase block font-medium">Risiko Beban Benturan (Impact Stress)</span>
        <span className="text-sm font-black font-tabular text-[var(--color-alert-red)]">TINGGI (DIBLOKIR)</span>
        <span className="text-[10px] text-[var(--color-text-secondary)] block">Hentakan lari 2.5–3x BB kontraindikasi klinis</span>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5">
        <span className="text-[10px] text-[var(--color-text-muted)] uppercase block font-medium">Beban Geser Sendi (Joint Shear Torque)</span>
        <span className="text-sm font-black font-tabular text-[var(--color-cycling)]">MODERAT (TERKONTROL)</span>
        <span className="text-[10px] text-[var(--color-text-secondary)] block">Aman dengan gigi ringan dan kadens 85+ RPM</span>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-1.5">
        <span className="text-[10px] text-[var(--color-text-muted)] uppercase block font-medium">Kapasitas Aerobik Kardiovaskular</span>
        <span className="text-sm font-black font-tabular text-[var(--color-endurance)]">AKTIF &amp; AMAN</span>
        <span className="text-[10px] text-[var(--color-text-secondary)] block">Fondasi Zone 2 terus berkembang via sepeda</span>
      </div>
    </div>
  );
}

