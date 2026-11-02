"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AuthoritativeAthleteHealthContext,
  AthleteInjury,
  AthletePainLog,
  AthleteTrainingResponse,
  AthleteMedicalAssessment,
  HealthAuditTrail,
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
  History,
  FileText,
  User,
  Heart,
  ChevronRight,
  TrendingDown,
  Info,
  Check,
  Eye,
  Layers,
} from "lucide-react";
import { PostActivityCheckinModal } from "./PostActivityCheckinModal";

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
    "overview" | "injuries" | "pain_logs" | "responses" | "clinical" | "audit"
  >("overview");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("Right Ankle");
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isNewInjuryOpen, setIsNewInjuryOpen] = useState(false);

  // New Injury Form State
  const [newRegion, setNewRegion] = useState("Right Ankle");
  const [newSide, setNewSide] = useState<"LEFT" | "RIGHT" | "BILATERAL" | "AXIAL">("RIGHT");
  const [newMechanism, setNewMechanism] = useState("");
  const [newTimeframe, setNewTimeframe] = useState("");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [newSeverity, setNewSeverity] = useState<"MILD" | "MODERATE" | "SEVERE">("MODERATE");
  const [newSwelling, setNewSwelling] = useState(false);
  const [newLimitations, setNewLimitations] = useState("");
  const [isSubmittingInjury, setIsSubmittingInjury] = useState(false);
  const [injuryFormMsg, setInjuryFormMsg] = useState<string | null>(null);

  const { profile, injuries, recentPainLogs, recentResponses, medicalAssessments, latestReadiness } = context;

  const handleCreateInjury = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInjury(true);
    setInjuryFormMsg(null);

    try {
      const res = await fetch("/api/athlete/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body_region: newRegion,
          side: newSide,
          injury_mechanism: newMechanism,
          timeframe_description: newTimeframe,
          previous_symptoms: newSymptoms,
          initial_severity: newSeverity,
          previous_swelling: newSwelling,
          functional_limitations: newLimitations,
          medical_evaluation_status: "PENDING_CLINICAL_ASSESSMENT",
          current_status: "ACTIVE_SYMPTOMATIC",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gagal mencatat cedera baru");
      }

      setInjuryFormMsg("Rekam jejak cedera baru berhasil disimpan! Kesiapan latihan diperbarui.");
      setTimeout(() => {
        setIsNewInjuryOpen(false);
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setInjuryFormMsg(`Error: ${err.message}`);
    } finally {
      setIsSubmittingInjury(false);
    }
  };

  const selectedInjury = injuries.find((i) => i.body_region.toLowerCase() === selectedBodyPart.toLowerCase());

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
        <form
          onSubmit={handleCreateInjury}
          className="p-4 rounded-sm bg-[#161922] border border-[#FF2A6D]/40 space-y-3 font-mono text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
            <span className="text-xs font-bold text-[#F0F2F5] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
              Form Pendaftaran Gejala / Riwayat Cedera Baru
            </span>
            <button
              type="button"
              onClick={() => setIsNewInjuryOpen(false)}
              className="text-[#9BA3AF] hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Area Tubuh (Body Region)</label>
              <input
                type="text"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="Contoh: Right Ankle, Achilles, Hamstring"
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Sisi (Side)</label>
              <select
                value={newSide}
                onChange={(e: any) => setNewSide(e.target.value)}
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              >
                <option value="RIGHT">Kanan (RIGHT)</option>
                <option value="LEFT">Kiri (LEFT)</option>
                <option value="BILATERAL">Kedua Sisi (BILATERAL)</option>
                <option value="AXIAL">Punggung/Tengah (AXIAL)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Tingkat Keparahan Awal</label>
              <select
                value={newSeverity}
                onChange={(e: any) => setNewSeverity(e.target.value)}
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              >
                <option value="MILD">Ringan (MILD)</option>
                <option value="MODERATE">Sedang (MODERATE)</option>
                <option value="SEVERE">Berat (SEVERE)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Mekanisme Cedera / Pemicu</label>
              <input
                type="text"
                value={newMechanism}
                onChange={(e) => setNewMechanism(e.target.value)}
                placeholder="Contoh: Salah mendarat saat basket, gesekan benturan aspal"
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Rentang Waktu Terjadi</label>
              <input
                type="text"
                value={newTimeframe}
                onChange={(e) => setNewTimeframe(e.target.value)}
                placeholder="Contoh: 3-6 bulan lalu, 2 minggu terakhir"
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#9BA3AF] mb-1 uppercase">Keterbatasan Fungsional Saat Ini</label>
              <input
                type="text"
                value={newLimitations}
                onChange={(e) => setNewLimitations(e.target.value)}
                placeholder="Contoh: Nyeri saat hentakan, jalan normal, sepeda bebas nyeri"
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#F0F2F5]">
                <input
                  type="checkbox"
                  checked={newSwelling}
                  onChange={(e) => setNewSwelling(e.target.checked)}
                  className="w-4 h-4 accent-[#FF2A6D]"
                />
                <span>Pernah Mengalami Pembengkakan Sendi?</span>
              </label>
            </div>
          </div>

          {injuryFormMsg && (
            <div className="p-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[11px] text-[#00F0FF]">
              {injuryFormMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2430]">
            <button
              type="button"
              onClick={() => setIsNewInjuryOpen(false)}
              className="px-3 py-1 rounded-sm bg-[#090A0F] text-[#9BA3AF] hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingInjury}
              className="px-4 py-1 rounded-sm bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 font-semibold hover:bg-[#FF2A6D]/30 transition-colors"
            >
              {isSubmittingInjury ? "Menyimpan..." : "Simpan Dossier Cedera"}
            </button>
          </div>
        </form>
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

      {/* ================================================================= */}
      {/* TAB 1: OVERVIEW & BIOMETRIC CALIBRATION                          */}
      {/* ================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Physical Baseline Matrix */}
          <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] font-mono text-xs">
              <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                Parameter Profil Fisik Terverifikasi (Apex Athlete)
              </span>
              <span className="text-[#5A6272]">Frekuensi Latihan: {profile?.training_days_per_week || 3} hari/minggu</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center font-mono">
              <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Usia Atlet</span>
                <span className="text-base font-bold font-tabular text-[#F0F2F5]">{profile?.age || 22}</span>
                <span className="text-[9px] text-[#9BA3AF] block">tahun</span>
              </div>

              <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Tinggi Badan</span>
                <span className="text-base font-bold font-tabular text-[#F0F2F5]">{profile?.height_cm || 170}</span>
                <span className="text-[9px] text-[#9BA3AF] block">cm</span>
              </div>

              <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Berat Badan</span>
                <span className="text-base font-bold font-tabular text-[#F0F2F5]">{profile?.weight_kg || 65}</span>
                <span className="text-[9px] text-[#9BA3AF] block">kg</span>
              </div>

              <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Indeks Massa Tubuh</span>
                <span className="text-base font-bold font-tabular text-[#10B981]">{profile?.bmi || 22.5}</span>
                <span className="text-[9px] text-[#10B981] block">Normal (Eutrofik)</span>
              </div>

              <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Detak Istirahat (RHR)</span>
                <span className="text-base font-bold font-tabular text-[#FF2A6D]">{profile?.resting_heart_rate || 68}</span>
                <span className="text-[9px] text-[#9BA3AF] block">bpm (Sensor Teruji)</span>
              </div>

              <div className="p-3 rounded-sm bg-[#161922] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block uppercase">Cabang Utama</span>
                <span className="text-base font-bold text-[#00F0FF]">Lari & Sepeda</span>
                <span className="text-[9px] text-[#9BA3AF] block">Multi-Disiplin</span>
              </div>
            </div>
          </div>

          {/* Laboratory Sensor Thresholds: Zero-Hallucination Policy */}
          <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
              <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#FF2A6D]" />
                Ambang Sensorik Laboratorium Fisiologis
              </span>
              <span className="text-[#00F0FF] text-[10px]">Kebijakan Non-Fabrikasi Data</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block">Detak Jantung Maksimal (HRmax)</span>
                <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
                <span className="text-[9px] text-[#3A404D]">Perlu tes treadmill lab</span>
              </div>

              <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block">Ambang Laktat (LTHR)</span>
                <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
                <span className="text-[9px] text-[#3A404D]">Perlu sampling darah laktat</span>
              </div>

              <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block">Daya Ambang Fungsional (FTP)</span>
                <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
                <span className="text-[9px] text-[#3A404D]">Perlu power meter 20m test</span>
              </div>

              <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430]">
                <span className="text-[10px] text-[#5A6272] block">Konsumsi Oksigen Maks (VO2max)</span>
                <span className="text-xs font-semibold text-[#5A6272] block mt-1">Belum Terukur (null)</span>
                <span className="text-[9px] text-[#3A404D]">Perlu spirometri masker</span>
              </div>
            </div>

            <p className="text-[11px] text-[#9BA3AF] leading-relaxed bg-[#090A0F] p-3 rounded-sm border border-[#1F2430]/60">
              <strong className="text-[#00F0FF]">Integritas Data:</strong> Platform menolak membuat estimasi zona daya atau detak jantung tanpa pengukuran laboratorium yang tervalidasi. Seluruh rekomendasi pelatih berbasis pada skala persepsi beban (RPE Borg CR10), durasi aman, dan kadens mekanis.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: ANATOMICAL BODY MAP & INJURY DOSSIER                      */}
      {/* ================================================================= */}
      {activeTab === "injuries" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Interactive Anatomical Body Region Selector (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
              <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00F0FF]" />
                Peta Anatomis & Area Gejala
              </span>
              <span className="text-[10px] text-[#5A6272]">Klik untuk Inspeksi</span>
            </div>

            {/* Visual Anatomical Body Matrix */}
            <div className="space-y-2">
              <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-center text-xs text-[#5A6272]">
                Kepala & Leher (Bebas Gejala ✅)
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-[#5A6272]">
                  Bahu Kiri (Aman)
                </div>
                <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-[#5A6272]">
                  Bahu Kanan (Aman)
                </div>
              </div>

              <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-center text-xs text-[#5A6272]">
                Toraks & Tulang Belakang (Aman)
              </div>

              {/* Lower Extremity Focus Areas */}
              <button
                type="button"
                onClick={() => setSelectedBodyPart("Anterior Knees")}
                className={`w-full p-2.5 rounded-sm border text-left flex items-center justify-between transition-all ${
                  selectedBodyPart.toLowerCase().includes("knee")
                    ? "bg-[#FF2A6D]/15 border-[#FF2A6D] text-white shadow-sm"
                    : "bg-[#161922] border-[#1F2430] text-[#9BA3AF] hover:border-[#FF2A6D]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-none bg-[#FF2A6D]" />
                  <span className="font-bold">Lutut Anterior (Bilateral Knees)</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#FF2A6D]/20 text-[#FF2A6D] font-bold">
                  ON_HOLD
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBodyPart("Right Ankle")}
                className={`w-full p-2.5 rounded-sm border text-left flex items-center justify-between transition-all ${
                  selectedBodyPart.toLowerCase().includes("ankle")
                    ? "bg-[#FF2A6D]/15 border-[#FF2A6D] text-white shadow-sm"
                    : "bg-[#161922] border-[#1F2430] text-[#9BA3AF] hover:border-[#FF2A6D]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-none bg-[#FF2A6D]" />
                  <span className="font-bold">Engkel Kanan (Right Ankle)</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#FF2A6D]/20 text-[#FF2A6D] font-bold">
                  ON_HOLD
                </span>
              </button>

              <div className="p-2 rounded-sm bg-[#161922] border border-[#1F2430] text-center text-xs text-[#5A6272]">
                Telapak Kaki & Plantar (Bebas Gejala)
              </div>
            </div>
          </div>

          {/* Dossier Detail for Selected Body Region (7 cols) */}
          <div className="lg:col-span-7 p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
            {selectedInjury ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1F2430]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-none bg-[#FF2A6D]" />
                    <h3 className="text-sm font-bold text-[#F0F2F5] uppercase">
                      {selectedInjury.body_region} ({selectedInjury.side})
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-sm bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold">
                    {selectedInjury.medical_evaluation_status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#9BA3AF]">
                  <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                    <span className="text-[10px] text-[#5A6272] block uppercase">Mekanisme Cedera & Waktu</span>
                    <p className="text-[#F0F2F5] font-medium mt-0.5">{selectedInjury.injury_mechanism}</p>
                    <span className="text-[10px] text-[#00F0FF] block mt-1">Rentang: {selectedInjury.timeframe_description}</span>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                    <span className="text-[10px] text-[#5A6272] block uppercase">Riwayat Pembengkakan & Gejala</span>
                    <p className="text-[#F0F2F5] font-medium mt-0.5">
                      {selectedInjury.previous_symptoms || "Tidak ada riwayat pembengkakan akut"}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430]">
                    <span className="text-[10px] text-[#5A6272] block uppercase">Kapasitas Fungsional Saat Ini</span>
                    <p className="text-[#F0F2F5] font-medium mt-0.5">{selectedInjury.functional_limitations}</p>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-[11px] space-y-1">
                    <span className="text-[10px] text-[#FF2A6D] block uppercase font-bold">Catatan Klinis & Arahan Keselamatan:</span>
                    <p className="text-[#9BA3AF] italic">{selectedInjury.recovery_notes}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#5A6272]">
                Pilih area tubuh di sebelah kiri untuk melihat rincian riwayat cedera.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: LONGITUDINAL PAIN LOGS                                     */}
      {/* ================================================================= */}
      {activeTab === "pain_logs" && (
        <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
            <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#D4FF00]" />
              Rekam Jejak Pemantauan Nyeri Longitudinal (Pain Scale 0–10)
            </span>
            <span className="text-[#5A6272]">{recentPainLogs.length} Entri Tercatat</span>
          </div>

          <div className="space-y-2">
            {recentPainLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-sm bg-[#161922] border border-[#1F2430] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F0F2F5]">{log.body_region} ({log.side})</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#090A0F] text-[#00F0FF] border border-[#1F2430]">
                      {log.associated_activity}
                    </span>
                    <span className="text-[10px] text-[#5A6272]">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#9BA3AF]">
                    {log.functional_limitations || "Pemantauan nyeri teratur pasca pembebanan"}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-center shrink-0">
                  <div className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] min-w-16">
                    <span className="text-[9px] text-[#5A6272] block">Saat Sesi</span>
                    <span className="text-sm font-bold font-tabular text-[#FF2A6D]">{log.pain_during_activity ?? 0}/10</span>
                  </div>
                  <div className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] min-w-16">
                    <span className="text-[9px] text-[#5A6272] block">Segera Usai</span>
                    <span className="text-sm font-bold font-tabular text-[#FF2A6D]">{log.pain_immediately_after ?? 0}/10</span>
                  </div>
                  <div className="p-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] min-w-16">
                    <span className="text-[9px] text-[#5A6272] block">24 Jam Nanti</span>
                    <span className="text-sm font-bold font-tabular text-[#10B981]">{log.pain_24h_after ?? 0}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: STRAVA RESPONSES & EMPIRICAL CORRELATION                    */}
      {/* ================================================================= */}
      {activeTab === "responses" && (
        <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
            <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
              <ActivityIcon className="w-3.5 h-3.5 text-[#10B981]" />
              Korelasi Respons Gejala Terhadap Sesi Nyata Strava
            </span>
            <span className="text-[#5A6272]">Validasi Toleransi Beban</span>
          </div>

          <div className="space-y-2.5">
            {recentResponses.map((res) => (
              <div
                key={res.id}
                className="p-3.5 rounded-sm bg-[#161922] border border-[#1F2430] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-[#1F2430]/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F0F2F5]">
                      {res.sport_type} • {res.distance_km} km
                    </span>
                    <span className="text-[10px] text-[#5A6272]">
                      ({Math.round(res.duration_seconds / 60)} menit durasi)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      Nyeri: {res.pain_during_activity ?? 0}/10
                    </span>
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                      RPE: {res.rpe_score || 6.0}/10
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#9BA3AF] leading-relaxed">
                  {res.athlete_comments}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#5A6272] pt-1 border-t border-[#1F2430]/40">
                  <span>Bengkak: {res.swelling_observed ? "Terdeteksi ⚠️" : "Nihil ✅"}</span>
                  <span>Instabilitas: {res.instability_observed ? "Terdeteksi ⚠️" : "Stabil ✅"}</span>
                  <span>Kelelahan: {res.fatigue_response}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 5: CLINICAL ASSESSMENTS & RETURN-TO-SPORT                     */}
      {/* ================================================================= */}
      {activeTab === "clinical" && (
        <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-4 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2430] text-xs">
            <span className="font-bold text-[#F0F2F5] uppercase flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#00F0FF]" />
              Catatan Penilaian Klinis & Kriteria Return-to-Sport
            </span>
            <span className="text-[#FF2A6D] text-[10px]">Menunggu Jadwal Fisioterapi</span>
          </div>

          <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F0F2F5]">Status Penilaian Fisioterapi Saat Ini:</span>
              <span className="px-2 py-0.5 rounded-sm bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[10px]">
                PENDING_CLINICAL_ASSESSMENT
              </span>
            </div>

            <p className="text-[11px] text-[#9BA3AF] leading-relaxed pt-1">
              Atlet belum menjalani penilaian formal oleh fisioterapis olahraga atau dokter spesialis ortopedi untuk mengevaluasi integritas ligamen engkel (*anterior talofibular ligament / calcaneofibular ligament*) serta melacak penyebab pasti nyeri lutut anterior bilateral.
            </p>

            <div className="p-3 bg-[#090A0F] rounded-sm border border-[#1F2430] text-[11px] text-[#9BA3AF] space-y-1 mt-2">
              <span className="font-bold text-[#00F0FF] block uppercase">Kriteria Kembali Berlari (Return-to-Run Criteria):</span>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Bebas nyeri penuh saat jalan kaki cepat dan naik-turun tangga tanpa kompensasi gaya berjalan.</li>
                <li>Mampu melakukan 25x single-leg calf raises tanpa nyeri atau ketidakstabilan.</li>
                <li>Mampu melakukan 30 detik single-leg balance dengan mata tertutup.</li>
                <li>Izin tertulis atau persetujuan lisan dari tenaga medis terlisensi.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

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

