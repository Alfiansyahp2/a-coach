"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AuthoritativeAthleteHealthContext,
  Activity,
} from "@/types";
import {
  ShieldAlert,
  Activity as ActivityIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Calendar,
  Lock,
  Stethoscope,
  PlusCircle,
  Clock,
  Compass,
  Gauge,
  Zap,
  Footprints,
  Bike,
  ArrowRight,
} from "lucide-react";
import { PostActivityCheckinModal } from "./PostActivityCheckinModal";

interface AthleteHealthDeckProps {
  healthContext: AuthoritativeAthleteHealthContext | null;
  recentActivities?: Activity[];
}

export function AthleteHealthDeck({
  healthContext,
  recentActivities = [],
}: AthleteHealthDeckProps) {
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);

  if (!healthContext || !healthContext.profile) {
    return null;
  }

  const { latestReadiness } = healthContext;
  const isRunningOnHold =
    latestReadiness?.running_readiness === "ON_HOLD" ||
    latestReadiness?.running_readiness === "REQUIRES_CLINICAL_REVIEW";
  const isCyclingConditional = latestReadiness?.cycling_readiness === "CONDITIONAL";

  return (
    <div className="bg-[#12151D] border border-[#1F2430] rounded-sm p-4 space-y-4">
      {/* 1. Header Bar: System Mode & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2430]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#00F0FF] shadow-sm">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Training Readiness & Biomechanical Load Indicator
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-none bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/30 font-semibold">
                ACTIVE LOAD GATE
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5A6272] block">
              Indikator Ambang Batas Latihan Real-Time Berdasarkan Toleransi Sendi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/health"
            className="px-2.5 py-1 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#FF2A6D] text-[#9BA3AF] hover:text-[#FF2A6D] text-[10px] font-mono font-semibold transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3 h-3 text-[#FF2A6D]" />
            <span>DETAIL PROFIL KESEHATAN</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </Link>
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="px-2.5 py-1 rounded-sm bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-[10px] font-mono font-semibold hover:bg-[#00F0FF]/25 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3 h-3" />
            CHECK-IN GEJALA
          </button>
        </div>
      </div>

      {/* 2. Visual Training Capacity Gauges (RUNNING vs CYCLING) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: RUNNING CAPACITY GAUGE (Impact Load) */}
        <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] border-t-2 border-t-[#FF2A6D] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono mb-2">
              <span className="text-[#D4FF00] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Footprints className="w-3.5 h-3.5 text-[#D4FF00]" />
                Kapasitas Beban Lari (Impact Load)
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-sm bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/40">
                0% • ON_HOLD
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-[#9BA3AF]">Toleransi Benturan Sendi:</span>
                <span className="text-[#FF2A6D] font-bold font-tabular">0.0 km / Maks 0.0 km</span>
              </div>
              <div className="w-full h-2 rounded-none bg-[#090A0F] border border-[#1F2430] overflow-hidden">
                <div className="h-full bg-[#FF2A6D] w-0 transition-all duration-500" />
              </div>
            </div>

            {/* Specific Training Parameters */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[#5A6272] block">Jarak Maksimum</span>
                <span className="text-sm font-bold font-tabular text-[#FF2A6D]">0 km</span>
                <span className="text-[9px] text-[#9BA3AF] block">Benturan dilarang</span>
              </div>
              <div className="p-2 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[#5A6272] block">Fokus Latihan</span>
                <span className="text-sm font-bold font-tabular text-[#F0F2F5]">Mobilitas Pasif</span>
                <span className="text-[9px] text-[#9BA3AF] block">Isometrik non-impact</span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-[#9BA3AF] mt-2.5 leading-relaxed bg-[#090A0F]/60 p-2 rounded-sm border border-[#1F2430]/60">
              <strong className="text-[#FF2A6D]">Alasan Pembatasan:</strong> Beban hentakan lari (2.5–3x berat badan per langkah) membebani ligamen engkel kanan yang sedang pulih dan memicu rasa pegal di tempurung kedua lutut.
            </p>
          </div>

          <div className="pt-2 border-t border-[#1F2430]/60 flex items-center justify-between text-[10px] font-mono text-[#5A6272]">
            <span className="flex items-center gap-1 text-[#FF2A6D]">
              <Lock className="w-3 h-3" />
              Progresi Volume Dikunci
            </span>
            <span className="text-[#00F0FF]">Menunggu Evaluasi Fisioterapi</span>
          </div>
        </div>

        {/* RIGHT: CYCLING CAPACITY GAUGE (Closed-Chain Aerobic) */}
        <div className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] border-t-2 border-t-[#00F0FF] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono mb-2">
              <span className="text-[#00F0FF] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Bike className="w-3.5 h-3.5 text-[#00F0FF]" />
                Kapasitas Beban Sepeda (Non-Impact)
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-sm bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40">
                60% • CONDITIONAL
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-[#9BA3AF]">Toleransi Jarak Aman / Sesi:</span>
                <span className="text-[#00F0FF] font-bold font-tabular">Hingga 30.0 km</span>
              </div>
              <div className="w-full h-2 rounded-none bg-[#090A0F] border border-[#1F2430] overflow-hidden">
                <div className="h-full bg-[#00F0FF] w-[60%] transition-all duration-500" />
              </div>
            </div>

            {/* Specific Training Parameters */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[#5A6272] block">Batas Sesi / Rute</span>
                <span className="text-sm font-bold font-tabular text-[#00F0FF]">≤ 30 km / 60m</span>
                <span className="text-[9px] text-[#9BA3AF] block">Rute datar (flat terrain)</span>
              </div>
              <div className="p-2 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[#5A6272] block">Kadens Disarankan</span>
                <span className="text-sm font-bold font-tabular text-[#D4FF00]">85–95 RPM</span>
                <span className="text-[9px] text-[#9BA3AF] block">Zona 1–2 (Torsi Rendah)</span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-[#9BA3AF] mt-2.5 leading-relaxed bg-[#090A0F]/60 p-2 rounded-sm border border-[#1F2430]/60">
              <strong className="text-[#00F0FF]">Basis Toleransi Empiris:</strong> Sesi sepeda 56.10 km terbukti tuntas dengan nyeri 0/10 dan tanpa bengkak. Aman untuk menjaga kapasitas kardiovaskular dengan memutar rantai ringan.
            </p>
          </div>

          <div className="pt-2 border-t border-[#1F2430]/60 flex items-center justify-between text-[10px] font-mono text-[#5A6272]">
            <span className="flex items-center gap-1 text-[#10B981]">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
              56.10 km: Bebas Nyeri & Bengkak
            </span>
            <span className="text-[#00F0FF]">Hindari Tanjakan Berdiri / Sprint</span>
          </div>
        </div>
      </div>

      {/* 3. Actionable Training Directives: What to Do & What to Avoid */}
      <div className="p-3 bg-[#090A0F] border border-[#1F2430] rounded-sm space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60 text-[10px] font-mono">
          <span className="text-[#F0F2F5] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#D4FF00]" />
            Panduan Taktis Latihan Atletik Hari Ini
          </span>
          <span className="text-[#5A6272]">Instruksi Spesifik Pelatih & Batasan Beban</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {/* Permitted Directives */}
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#10B981]/30 space-y-1.5">
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
              Diizinkan & Disarankan (Authorized Actions):
            </span>
            <ul className="space-y-1 text-[11px] text-[#9BA3AF]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#10B981]">•</span>
                <span><strong>Gowes Aerobik Ringan:</strong> 30–50 menit Zona 2 rute datar, kadens tinggi 90 RPM (RPE 4–5/10).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#10B981]">•</span>
                <span><strong>Rehabilitasi Isometrik:</strong> Penguatan betis (calf raises tanpa hentakan), latihan tibialis, dan quad sets.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#10B981]">•</span>
                <span><strong>Pemulihan:</strong> Latihan mobilitas engkel dorsofleksi dan peregangan rantai posterior pasif.</span>
              </li>
            </ul>
          </div>

          {/* Blocked Directives */}
          <div className="p-2.5 rounded-sm bg-[#161922] border border-[#FF2A6D]/30 space-y-1.5">
            <span className="text-[10px] font-bold text-[#FF2A6D] uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3 h-3 text-[#FF2A6D]" />
              Dilarang & Kontraindikasi (Blocked Actions):
            </span>
            <ul className="space-y-1 text-[11px] text-[#9BA3AF]">
              <li className="flex items-start gap-1.5">
                <span className="text-[#FF2A6D]">•</span>
                <span><strong>Sesi Lari Apapun:</strong> Lari jalan raya, treadmill, atau jogging pemanasan (risiko benturan sendi tinggi).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#FF2A6D]">•</span>
                <span><strong>Tanjakan Sepeda Berdiri:</strong> Gowes tanjakan terjal atau sprint gigi berat yang memicu torsi sendi lutut.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#FF2A6D]">•</span>
                <span><strong>Plyometrics / Lompatan:</strong> Aktivitas dengan pendaratan tidak terduga seperti basket atau lompat tali.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Biomechanical Risk & Telemetry Indicator Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-center">
        <div className="p-2.5 rounded-sm bg-[#161922] border border-[#FF2A6D]/40 space-y-0.5">
          <span className="text-[9px] text-[#9BA3AF] uppercase block">Risiko Beban Benturan (Impact Stress)</span>
          <span className="text-sm font-bold font-tabular text-[#FF2A6D]">TINGGI (DIBLOKIR)</span>
          <span className="text-[9px] text-[#5A6272] block">Hentakan lari 2.5–3x BB kontraindikasi</span>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161922] border border-[#00F0FF]/40 space-y-0.5">
          <span className="text-[9px] text-[#9BA3AF] uppercase block">Beban Geser Sendi (Joint Shear Torque)</span>
          <span className="text-sm font-bold font-tabular text-[#00F0FF]">MODERAT (TERKONTROL)</span>
          <span className="text-[9px] text-[#5A6272] block">Aman dengan kadens tinggi 90 RPM</span>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161922] border border-[#D4FF00]/40 space-y-0.5">
          <span className="text-[9px] text-[#9BA3AF] uppercase block">Kapasitas Aerobik Kardiovaskular</span>
          <span className="text-sm font-bold font-tabular text-[#D4FF00]">AKTIF & AMAN</span>
          <span className="text-[9px] text-[#5A6272] block">Terjaga via sepeda tanpa cedera tambahan</span>
        </div>
      </div>

      {/* Checkin Modal */}
      <PostActivityCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        recentActivities={recentActivities}
      />
    </div>
  );
}
