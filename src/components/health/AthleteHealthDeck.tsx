"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AuthoritativeAthleteHealthContext,
  Activity,
} from "@/types";
import {
  ShieldAlert,
  Gauge,
  Zap,
  Footprints,
  Bike,
  ArrowRight,
  PlusCircle,
  Lock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
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
  const [activeTab, setActiveTab] = useState<"overview" | "directives" | "risks">("overview");
  const [isExpanded, setIsExpanded] = useState(true);

  if (!healthContext || !healthContext.profile) {
    return null;
  }

  const { latestReadiness } = healthContext;
  const isRunningOnHold =
    latestReadiness?.running_readiness === "ON_HOLD" ||
    latestReadiness?.running_readiness === "REQUIRES_CLINICAL_REVIEW";
  const isCyclingConditional =
    latestReadiness?.cycling_readiness === "CONDITIONAL";

  return (
    <div className="bg-[#12151D] border border-[#1F2430] hover:border-[#2D3547] rounded-sm transition-all duration-200 overflow-hidden shadow-sm">
      {/* 1. Header Bar: System Mode & Quick Actions */}
      <div className="p-3.5 bg-[#161922] border-b border-[#1F2430] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#090A0F] border border-[#2D3547] flex items-center justify-center text-[#FF2A6D] shrink-0 shadow-inner">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Biomechanical Load &amp; Joint Safety Gate
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-xs bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold uppercase tracking-wide">
                ACTIVE RESTRICTION GATE
              </span>
            </div>
            <span className="text-[10.5px] font-mono text-[#9BA3AF] block">
              Protokol Perlindungan Sendi: Engkel Kanan (Riwayat Bengkak) &amp; Tempurung Kedua Lutut
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/health"
            className="px-2.5 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] hover:border-[#FF2A6D] text-[#9BA3AF] hover:text-[#FF2A6D] text-[10.5px] font-mono font-semibold transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF2A6D]" />
            <span>DETAIL PROFIL</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setIsCheckinOpen(true)}
            className="px-3 py-1.5 rounded-sm bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-[10.5px] font-mono font-bold hover:bg-[#00F0FF]/25 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>CHECK-IN NYERI</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-white transition-colors"
            title={isExpanded ? "Sembunyikan Rincian" : "Tampilkan Rincian"}
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Sub-Tabs Selector */}
          <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-mono w-fit">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 font-medium ${
                activeTab === "overview"
                  ? "bg-[#1C212E] text-white border border-[#2D3547] font-bold"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <Gauge className="w-3 h-3 text-[#00F0FF]" />
              <span>Kapasitas Lari vs Sepeda</span>
            </button>
            <button
              onClick={() => setActiveTab("directives")}
              className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 font-medium ${
                activeTab === "directives"
                  ? "bg-[#1C212E] text-[#D4FF00] border border-[#D4FF00]/40 font-bold"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <Zap className="w-3 h-3 text-[#D4FF00]" />
              <span>Panduan Taktis Latihan</span>
            </button>
            <button
              onClick={() => setActiveTab("risks")}
              className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 font-medium ${
                activeTab === "risks"
                  ? "bg-[#1C212E] text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-[#FF2A6D]" />
              <span>Matriks Risiko Sendi</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW (RUNNING VS CYCLING CAPACITY) */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT: RUNNING CAPACITY GAUGE */}
              <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] border-l-4 border-l-[#FF2A6D] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#F0F2F5] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                      <Footprints className="w-4 h-4 text-[#FF2A6D]" />
                      Beban Hentakan Lari (Impact Load)
                    </span>
                    <span className="px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-xs bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/40">
                      0% • ON_HOLD
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10.5px] font-mono">
                      <span className="text-[#9BA3AF]">Toleransi Benturan Sendi:</span>
                      <span className="text-[#FF2A6D] font-bold font-tabular">0.0 km / Maks 0.0 km</span>
                    </div>
                    <div className="w-full h-1.5 rounded-none bg-[#090A0F] border border-[#1F2430] overflow-hidden">
                      <div className="h-full bg-[#FF2A6D] w-0" />
                    </div>
                  </div>

                  {/* Parameters Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430]">
                      <span className="text-[10px] text-[#5A6272] block">Jarak Maksimum</span>
                      <span className="text-base font-black font-tabular text-[#FF2A6D]">0 km</span>
                      <span className="text-[9.5px] text-[#9BA3AF] block">Benturan dilarang</span>
                    </div>
                    <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430]">
                      <span className="text-[10px] text-[#5A6272] block">Fokus Latihan</span>
                      <span className="text-base font-black font-tabular text-[#F0F2F5]">Mobilitas</span>
                      <span className="text-[9.5px] text-[#9BA3AF] block">Isometrik non-impact</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-[#9BA3AF] mt-2.5 leading-relaxed bg-[#090A0F]/80 p-2.5 rounded-xs border border-[#1F2430]">
                    <strong className="text-[#FF2A6D]">Alasan Pembatasan:</strong> Beban hentakan lari (2.5–3x berat badan per langkah) membebani ligamen engkel kanan yang sedang pulih dan memicu rasa pegal di tempurung kedua lutut.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between text-[10.5px] font-mono text-[#5A6272]">
                  <span className="flex items-center gap-1 text-[#FF2A6D] font-semibold">
                    <Lock className="w-3 h-3" />
                    Progresi Volume Dikunci
                  </span>
                  <span className="text-[#00F0FF]">Menunggu Evaluasi Fisioterapi</span>
                </div>
              </div>

              {/* RIGHT: CYCLING CAPACITY GAUGE */}
              <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] border-l-4 border-l-[#00F0FF] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#F0F2F5] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                      <Bike className="w-4 h-4 text-[#00F0FF]" />
                      Beban Kayuhan Sepeda (Non-Impact)
                    </span>
                    <span className="px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40">
                      60% • CONDITIONAL
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10.5px] font-mono">
                      <span className="text-[#9BA3AF]">Toleransi Jarak Aman / Sesi:</span>
                      <span className="text-[#00F0FF] font-bold font-tabular">Hingga 30.0 km</span>
                    </div>
                    <div className="w-full h-1.5 rounded-none bg-[#090A0F] border border-[#1F2430] overflow-hidden">
                      <div className="h-full bg-[#00F0FF] w-[60%] transition-all duration-500" />
                    </div>
                  </div>

                  {/* Parameters Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430]">
                      <span className="text-[10px] text-[#5A6272] block">Batas Sesi / Rute</span>
                      <span className="text-base font-black font-tabular text-[#00F0FF]">≤ 30 km</span>
                      <span className="text-[9.5px] text-[#9BA3AF] block">Rute datar (flat terrain)</span>
                    </div>
                    <div className="p-2 rounded-xs bg-[#090A0F] border border-[#1F2430]">
                      <span className="text-[10px] text-[#5A6272] block">Kadens Disarankan</span>
                      <span className="text-base font-black font-tabular text-[#D4FF00]">85–95 RPM</span>
                      <span className="text-[9.5px] text-[#9BA3AF] block">Zone 2 (Torsi Rendah)</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-[#9BA3AF] mt-2.5 leading-relaxed bg-[#090A0F]/80 p-2.5 rounded-xs border border-[#1F2430]">
                    <strong className="text-[#00F0FF]">Toleransi Empiris Terverifikasi:</strong> Sesi sepeda 56.10 km tuntas dengan skor nyeri 0/10 dan tanpa pembengkakan sendi. Sangat aman menjaga daya tahan aerobik dengan kayuhan ringan.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1F2430] flex items-center justify-between text-[10.5px] font-mono text-[#5A6272]">
                  <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    56.10 km: Bebas Nyeri &amp; Bengkak
                  </span>
                  <span className="text-[#00F0FF]">Hindari Tanjakan Berdiri / Sprint</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECTIVES (WHAT TO DO & WHAT TO AVOID) */}
          {activeTab === "directives" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono animate-in fade-in duration-150">
              {/* Authorized Directives */}
              <div className="p-3.5 rounded-sm bg-[#161922] border border-[#10B981]/30 space-y-2">
                <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#1F2430]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  Aktivitas Diizinkan &amp; Disarankan:
                </span>
                <ul className="space-y-2 text-[11px] text-[#9BA3AF]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#10B981] font-bold">•</span>
                    <span><strong>Gowes Aerobik Zone 2:</strong> 30–50 menit rute datar, kadens stabil 85–95 RPM, RPE 3–4 (bisa mengobrol nyaman).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#10B981] font-bold">•</span>
                    <span><strong>Penguatan Isometrik:</strong> Calf raises lambat tanpa hentakan, penguatan tibialis anterior, dan quad isometric sets.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#10B981] font-bold">•</span>
                    <span><strong>Mobilitas Pasif:</strong> Dorsofleksi pergelangan kaki dan peregangan hamstring/betis pasca latihan.</span>
                  </li>
                </ul>
              </div>

              {/* Blocked Directives */}
              <div className="p-3.5 rounded-sm bg-[#161922] border border-[#FF2A6D]/30 space-y-2">
                <span className="text-xs font-bold text-[#FF2A6D] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#1F2430]">
                  <XCircle className="w-3.5 h-3.5 text-[#FF2A6D]" />
                  Aktivitas Dilarang (Kontraindikasi):
                </span>
                <ul className="space-y-2 text-[11px] text-[#9BA3AF]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#FF2A6D] font-bold">•</span>
                    <span><strong>Sesi Lari Apapun:</strong> Lari jalan raya, treadmill, maupun jogging pemanasan (risiko benturan sendi tinggi).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#FF2A6D] font-bold">•</span>
                    <span><strong>Gowes Tanjakan Berdiri:</strong> Hindari tanjakan terjal dengan gigi berat yang memicu torsi tinggi pada tempurung lutut.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#FF2A6D] font-bold">•</span>
                    <span><strong>Plyometrics &amp; Lompatan:</strong> Aktivitas dengan pendaratan tidak stabil seperti lompat tali atau futsal/basket.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: RISKS MATRIX */}
          {activeTab === "risks" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center animate-in fade-in duration-150">
              <div className="p-3 rounded-sm bg-[#161922] border border-[#FF2A6D]/40 space-y-1">
                <span className="text-[10px] text-[#9BA3AF] uppercase block">Risiko Beban Benturan (Impact Stress)</span>
                <span className="text-sm font-black font-tabular text-[#FF2A6D]">TINGGI (DIBLOKIR)</span>
                <span className="text-[10px] text-[#5A6272] block">Hentakan lari 2.5–3x BB kontraindikasi klinis</span>
              </div>

              <div className="p-3 rounded-sm bg-[#161922] border border-[#00F0FF]/40 space-y-1">
                <span className="text-[10px] text-[#9BA3AF] uppercase block">Beban Geser Sendi (Joint Shear Torque)</span>
                <span className="text-sm font-black font-tabular text-[#00F0FF]">MODERAT (TERKONTROL)</span>
                <span className="text-[10px] text-[#5A6272] block">Aman dengan gigi ringan dan kadens 85+ RPM</span>
              </div>

              <div className="p-3 rounded-sm bg-[#161922] border border-[#D4FF00]/40 space-y-1">
                <span className="text-[10px] text-[#9BA3AF] uppercase block">Kapasitas Aerobik Kardiovaskular</span>
                <span className="text-sm font-black font-tabular text-[#D4FF00]">AKTIF &amp; AMAN</span>
                <span className="text-[10px] text-[#5A6272] block">Fondasi Zone 2 terus berkembang via sepeda</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkin Modal */}
      <PostActivityCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        recentActivities={recentActivities}
      />
    </div>
  );
}
