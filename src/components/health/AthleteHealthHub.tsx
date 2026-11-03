"use client";

import React, { useState } from "react";
import { AuthoritativeAthleteHealthContext, Activity } from "@/types";
import {
  ShieldAlert,
  Activity as ActivityIcon,
  AlertTriangle,
  Scale,
  PlusCircle,
  History,
  Stethoscope,
  User,
  HeartPulse,
} from "lucide-react";
import { PostActivityCheckinModal } from "./PostActivityCheckinModal";
import { ClinicalOverviewTab } from "./hub/ClinicalOverviewTab";
import { InjuryDossierTab } from "./hub/InjuryDossierTab";
import { PainLogsTab } from "./hub/PainLogsTab";
import { TrainingResponsesTab } from "./hub/TrainingResponsesTab";
import { ClinicalAssessmentsTab } from "./hub/ClinicalAssessmentsTab";
import { NewInjuryForm } from "./hub/NewInjuryForm";

interface AthleteHealthHubProps {
  initialContext: AuthoritativeAthleteHealthContext;
  recentActivities: Activity[];
}

export function AthleteHealthHub({
  initialContext,
  recentActivities,
}: AthleteHealthHubProps) {
  const [context, setContext] = useState<AuthoritativeAthleteHealthContext>(initialContext);
  const [activeTab, setActiveTab] = useState<
    "overview" | "injuries" | "pain_logs" | "responses" | "clinical"
  >("overview");
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isNewInjuryOpen, setIsNewInjuryOpen] = useState(false);
  const [prefillRegion, setPrefillRegion] = useState<string | undefined>(undefined);

  const { profile, injuries, recentPainLogs, recentResponses, latestReadiness } = context;

  return (
    <div className="space-y-4">
      {/* 1. Header Banner & Status Strip */}
      <div className="p-4 sm:p-5 rounded-sm bg-gradient-to-r from-[#12151D] via-[#161B26] to-[#12151D] border border-[#1F2430] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-sm bg-[#161922] border border-[#FF2A6D]/40 flex items-center justify-center text-[#FF2A6D] shadow-sm shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Dossier Kesehatan &amp; Rekam Jejak Klinis Atlet
              </h1>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-xs bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A6D] animate-pulse" />
                Pemulihan Terpantau (Gejala Belum Tuntas)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#9BA3AF] block pt-0.5">
              Protokol Terpusat: Sepeda Beban Rendah Kondisional • Lari Ditunda Sementara Menunggu Izin Fisioterapi
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="px-3.5 py-1.5 rounded-sm bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CHECK-IN PASCA SESI</span>
          </button>
          <button
            onClick={() => setIsNewInjuryOpen(!isNewInjuryOpen)}
            className="px-3 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] hover:border-[#FF2A6D]/50 text-[#9BA3AF] hover:text-[#FF2A6D] transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
            <span>TAMBAH CATATAN CEDERA</span>
          </button>
        </div>
      </div>

      {/* Expandable Form: Add New Injury */}
      {isNewInjuryOpen && (
        <NewInjuryForm
          initialRegionName={prefillRegion}
          onClose={() => {
            setIsNewInjuryOpen(false);
            setPrefillRegion(undefined);
          }}
          onSuccess={() => {
            setIsNewInjuryOpen(false);
            setPrefillRegion(undefined);
            window.location.reload();
          }}
        />
      )}

      {/* 2. Interactive Navigation Tabs (Clean, unnumbered, high contrast) */}
      <div className="flex items-center gap-1 p-1 rounded-sm bg-[#12151D] border border-[#1F2430] text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-sm transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "overview"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Profil &amp; Biometrik</span>
        </button>

        <button
          onClick={() => setActiveTab("injuries")}
          className={`px-3 py-1.5 rounded-sm transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "injuries"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
          <span>Peta Cedera &amp; Sendi</span>
          <span className="px-1.5 py-0.2 rounded-xs bg-[#FF2A6D]/20 text-[#FF2A6D] text-[10px]">
            {injuries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pain_logs")}
          className={`px-3 py-1.5 rounded-sm transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "pain_logs"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>Log Nyeri</span>
          <span className="px-1.5 py-0.2 rounded-xs bg-[#D4FF00]/20 text-[#D4FF00] text-[10px]">
            {recentPainLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("responses")}
          className={`px-3 py-1.5 rounded-sm transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "responses"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <ActivityIcon className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Respon Strava</span>
          <span className="px-1.5 py-0.2 rounded-xs bg-[#10B981]/20 text-[#10B981] text-[10px]">
            {recentResponses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("clinical")}
          className={`px-3 py-1.5 rounded-sm transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "clinical"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Catatan Medis &amp; RTS</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "overview" && (
        <ClinicalOverviewTab profile={profile} context={context} />
      )}
      {activeTab === "injuries" && (
        <InjuryDossierTab
          injuries={injuries}
          onOpenNewInjury={(regionName) => {
            setPrefillRegion(regionName);
            setIsNewInjuryOpen(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
      {activeTab === "pain_logs" && (
        <PainLogsTab recentPainLogs={recentPainLogs} />
      )}
      {activeTab === "responses" && (
        <TrainingResponsesTab recentResponses={recentResponses} />
      )}
      {activeTab === "clinical" && (
        <ClinicalAssessmentsTab context={context} />
      )}

      {/* Mandatory Clinical Notice Footer */}
      <div className="p-3.5 rounded-sm bg-[#090A0F] border border-[#1F2430] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-[#5A6272]">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
          <span>
            Sistem pendukung keputusan latihan atletik ilmiah. Bukan alat diagnosis medis atau izin mandiri return-to-sport.
          </span>
        </div>
        <span className="text-[#9BA3AF]">
          Keputusan Dokter &amp; Fisioterapis Bersifat Mutlak Mengikat
        </span>
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
