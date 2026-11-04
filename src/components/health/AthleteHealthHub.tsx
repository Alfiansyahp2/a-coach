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
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-alert-red)]/30 flex items-center justify-center text-[var(--color-alert-red)] shadow-xs shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)]">
                Dossier Kesehatan &amp; Rekam Jejak Klinis Atlet
              </h1>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/30 font-bold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-alert-red)] animate-pulse" />
                Pemulihan Terpantau (Gejala Belum Tuntas)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--color-text-secondary)] block pt-0.5 truncate md:whitespace-normal">
              Protokol Terpusat: Sepeda Beban Rendah Kondisional • Lari Ditunda Sementara Menunggu Izin Fisioterapi
            </span>
          </div>
        </div>

        {/* Both action buttons positioned at the rightmost corner */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 ml-auto font-mono text-xs">
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)] hover:bg-[var(--color-cycling)]/20 font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CHECK-IN PASCA SESI</span>
          </button>
          <button
            onClick={() => setIsNewInjuryOpen(!isNewInjuryOpen)}
            className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-alert-red)]/50 text-[var(--color-text-secondary)] hover:text-[var(--color-alert-red)] transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
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

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "overview"
              ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <User className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>Profil &amp; Biometrik</span>
        </button>

        <button
          onClick={() => setActiveTab("injuries")}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "injuries"
              ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-alert-red)]" />
          <span>Peta Cedera &amp; Sendi</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] text-[10px]">
            {injuries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pain_logs")}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "pain_logs"
              ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <History className="w-3.5 h-3.5 text-[var(--color-running)]" />
          <span>Log Nyeri</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-running)]/10 text-[var(--color-running)] text-[10px]">
            {recentPainLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("responses")}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "responses"
              ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
          <span>Respon Strava</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-endurance)]/10 text-[var(--color-endurance)] text-[10px]">
            {recentResponses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("clinical")}
          className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 shrink-0 ${
            activeTab === "clinical"
              ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
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
      <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-[var(--color-text-muted)] shadow-xs">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />
          <span>
            Sistem pendukung keputusan latihan atletik ilmiah. Bukan alat diagnosis medis atau izin mandiri return-to-sport.
          </span>
        </div>
        <span className="text-[var(--color-text-secondary)] font-medium">
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
