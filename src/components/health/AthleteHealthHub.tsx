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

  const { profile, injuries, recentPainLogs, recentResponses, latestReadiness } = context;

  return (
    <div className="space-y-5">
      {/* 1. Header Banner & Status Strip */}
      <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#FF2A6D] shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Pusat Intelijen Kesehatan & Rekam Jejak Klinis Atlet
              </h1>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm bg-[#FF2A6D]/15 text-[#FF2A6D] border border-[#FF2A6D]/30 font-semibold">
                {latestReadiness?.athlete_status || "ACTIVE_WITH_UNRESOLVED_SYMPTOMS"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#5A6272]">
              Konteks Otoritatif Terpusat: Running Coach • Cycling Coach • Multi-Sport Coordinator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="px-3 py-1.5 rounded-sm bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            CHECK-IN PASCA LATIHAN
          </button>
          <button
            onClick={() => setIsNewInjuryOpen(!isNewInjuryOpen)}
            className="px-3 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] text-[#9BA3AF] hover:text-white transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
            TAMBAH DOSSIER CEDERA
          </button>
        </div>
      </div>

      {/* Expandable Form: Add New Injury */}
      {isNewInjuryOpen && (
        <NewInjuryForm
          onClose={() => setIsNewInjuryOpen(false)}
          onSuccess={() => {
            setIsNewInjuryOpen(false);
            window.location.reload();
          }}
        />
      )}

      {/* 2. Interactive Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-sm bg-[#12151D] border border-[#1F2430] text-[11px] font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 shrink-0 ${
            activeTab === "overview"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>1. PROFIL FISIK & KALIBRASI</span>
        </button>

        <button
          onClick={() => setActiveTab("injuries")}
          className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 shrink-0 ${
            activeTab === "injuries"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
          <span>2. PETA ANATOMI & DOSSIER CEDERA ({injuries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pain_logs")}
          className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 shrink-0 ${
            activeTab === "pain_logs"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#D4FF00]" />
          <span>3. LOG GEJALA NYERI ({recentPainLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("responses")}
          className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 shrink-0 ${
            activeTab === "responses"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <ActivityIcon className="w-3.5 h-3.5 text-[#10B981]" />
          <span>4. RESPONS STRAVA ({recentResponses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("clinical")}
          className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 shrink-0 ${
            activeTab === "clinical"
              ? "bg-[#1C212E] text-white border border-[#2D3547] shadow-sm"
              : "text-[#9BA3AF] hover:text-white"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>5. CATATAN MEDIS & RETURN-TO-SPORT</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "overview" && <ClinicalOverviewTab profile={profile} />}
      {activeTab === "injuries" && <InjuryDossierTab injuries={injuries} />}
      {activeTab === "pain_logs" && <PainLogsTab recentPainLogs={recentPainLogs} />}
      {activeTab === "responses" && <TrainingResponsesTab recentResponses={recentResponses} />}
      {activeTab === "clinical" && <ClinicalAssessmentsTab context={context} />}

      {/* Mandatory Clinical Notice Footer */}
      <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] font-mono text-[#5A6272]">
        <div className="flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
          <span>
            Sistem pendukung keputusan latihan atletik. Bukan alat diagnosis medis atau izin mandiri return-to-sport.
          </span>
        </div>
        <span className="text-[#3A404D]">Batasan Klinis Dokter Bersifat Mutlak Mengikat</span>
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
