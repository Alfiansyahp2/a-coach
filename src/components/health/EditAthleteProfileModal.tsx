"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Activity,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  User as UserIcon,
  Save,
  Check,
  Info,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { User, AthleteProfile, AuthoritativeAthleteHealthContext } from "@/types";

interface EditAthleteProfileModalProps {
  user?: Partial<User> | null;
  profile?: AthleteProfile | null;
  healthContext?: AuthoritativeAthleteHealthContext | null;
  variant?: "badge" | "button";
}

export function EditAthleteProfileModal({
  user,
  profile,
  healthContext,
  variant = "badge",
}: EditAthleteProfileModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"biometrics" | "medical">("biometrics");

  // Form states - Biometrics
  const [name, setName] = useState<string>(user?.name || "Apex Athlete");
  const [age, setAge] = useState<string>(String(profile?.age || 22));
  const [restingHr, setRestingHr] = useState<string>(String(user?.resting_heart_rate || profile?.resting_heart_rate || 68));
  const [heightCm, setHeightCm] = useState<string>(String(user?.height_cm || profile?.height_cm || 170));
  const [weightKg, setWeightKg] = useState<string>(String(user?.weight_kg || profile?.weight_kg || 65));
  const [trainingDays, setTrainingDays] = useState<number>(profile?.training_days_per_week || 3);

  // Form states - Medical Procedures & Assessments
  const ankleInjury = healthContext?.injuries.find((i) => i.body_region.toLowerCase().includes("ankle"));
  const kneeInjury = healthContext?.injuries.find((i) => i.body_region.toLowerCase().includes("knee"));

  const [ankleStatus, setAnkleStatus] = useState<string>(
    ankleInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT"
  );
  const [kneeStatus, setKneeStatus] = useState<string>(
    kneeInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT"
  );

  // New procedure form states
  const [hasNewProcedure, setHasNewProcedure] = useState<boolean>(false);
  const [procedureDate, setProcedureDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [providerType, setProviderType] = useState<string>("Physiotherapist");
  const [providerName, setProviderName] = useState<string>("");
  const [procedureDetails, setProcedureDetails] = useState<string>("");
  const [clinicalFindings, setClinicalFindings] = useState<string>("");
  const [clearanceGranted, setClearanceGranted] = useState<boolean>(false);

  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live BMI calculation
  const numericWeight = parseFloat(weightKg) || 0;
  const numericHeight = parseFloat(heightCm) || 0;
  const calculatedBmi =
    numericWeight > 0 && numericHeight > 0
      ? (numericWeight / ((numericHeight / 100) * (numericHeight / 100))).toFixed(1)
      : "22.5";

  const handleOpen = () => {
    setName(user?.name || "Apex Athlete");
    setAge(String(profile?.age || 22));
    setRestingHr(String(user?.resting_heart_rate || 68));
    setHeightCm(String(user?.height_cm || 170));
    setWeightKg(String(user?.weight_kg || 65));
    setTrainingDays(profile?.training_days_per_week || 3);
    setAnkleStatus(ankleInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT");
    setKneeStatus(kneeInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama atlet tidak boleh kosong.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload = {
        name: name.trim(),
        age: parseInt(age, 10) || 22,
        height_cm: parseFloat(heightCm) || 170,
        weight_kg: parseFloat(weightKg) || 65,
        resting_heart_rate: parseInt(restingHr, 10) || 68,
        training_days_per_week: trainingDays,
        // Medical assessment
        has_medical_procedure: hasNewProcedure,
        procedure_date: procedureDate,
        provider_type: providerType,
        provider_name: providerName.trim() || undefined,
        procedure_details: procedureDetails.trim() || undefined,
        clinical_findings: clinicalFindings.trim() || undefined,
        clearance_granted: clearanceGranted,
        ankle_status: ankleStatus,
        knee_status: kneeStatus,
      };

      const res = await fetch("/api/athlete/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui profil atlet.");
      }

      setSuccessMsg(
        clearanceGranted
          ? "Profil atlet & izin medis berhasil diperbarui! Kunci lari bertahap telah dibuka."
          : "Profil biometrik & data kesehatan berhasil diperbarui!"
      );

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* TRIGGER 1: BADGE TRIGGER (REPLACES STATIC HEADER BADGE) */}
      {variant === "badge" && (
        <div
          onClick={handleOpen}
          className="group cursor-pointer flex items-center gap-3 select-none"
          title="Klik untuk Edit Biometrik & Prosedur Kesehatan Atlet"
        >
          {/* Athlete Biometric Baseline Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#12151D] group-hover:bg-[#181C26] border border-[#1F2430] group-hover:border-[#00F0FF]/50 text-xs font-mono transition-all duration-150 shadow-sm">
            <span className="flex items-center gap-1 text-[#FF2A6D]">
              <Heart className="w-3 h-3 fill-[#FF2A6D]/20 group-hover:scale-110 transition-transform" />
              <span className="font-tabular font-bold">
                {user?.resting_heart_rate || 68}
              </span>
              <span className="text-[10px] text-[#9BA3AF]">bpm RHR</span>
            </span>
            <span className="text-[#3A404D]">|</span>
            <span className="text-[#00F0FF] font-tabular">
              {user?.height_cm || 170}{" "}
              <span className="text-[10px] text-[#9BA3AF]">cm</span>
            </span>
            <span className="text-[#3A404D]">|</span>
            <span className="text-[#D4FF00] font-tabular">
              {user?.weight_kg || 65}{" "}
              <span className="text-[10px] text-[#9BA3AF]">kg</span>
            </span>
            <span className="text-[#3A404D]">|</span>
            <span className="text-[#10B981] font-semibold text-[11px] font-tabular">
              BMI {calculatedBmi}
            </span>
            <Pencil className="w-2.5 h-2.5 text-[#5A6272] group-hover:text-[#00F0FF] transition-colors ml-0.5" />
          </div>

          {/* User Profile Avatar & Label */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#1F2430] group-hover:opacity-90 transition-opacity">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-6 h-6 rounded-sm border border-[#1F2430] object-cover group-hover:border-[#00F0FF] transition-colors"
              />
            )}
            <div className="hidden sm:block text-left font-mono">
              <div className="text-xs font-semibold text-[#F0F2F5] leading-none group-hover:text-[#00F0FF] transition-colors flex items-center gap-1">
                <span>{user?.name || "Apex Athlete"}</span>
                <Pencil className="w-2.5 h-2.5 text-[#5A6272] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[9px] text-[#10B981] leading-tight pt-0.5 flex items-center gap-1">
                <span>Calibrated Athlete</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRIGGER 2: STANDALONE BUTTON TRIGGER */}
      {variant === "button" && (
        <button
          onClick={handleOpen}
          className="px-3 py-1.5 rounded-sm bg-[#12151D] hover:bg-[#1C212E] border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Profil & Prosedur Kesehatan</span>
        </button>
      )}

      {/* MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[#0F1218] border border-[#1F2430] rounded-sm shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#1F2430] bg-[#12151D] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#F0F2F5] tracking-tight flex items-center gap-2">
                    EDIT PROFIL & PROSEDUR KESEHATAN
                    <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                      Calibrated Baseline
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#9BA3AF] font-mono">
                    Kalibrasi biometrik dasar (RHR, TB, BB) dan pencatatan riwayat prosedur medis / fisioterapi.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-sm text-[#9BA3AF] hover:text-white hover:bg-[#1C212E] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="px-5 pt-3 pb-2 bg-[#090A0F] border-b border-[#1F2430] flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("biometrics")}
                className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "biometrics"
                    ? "bg-[#1C212E] text-[#00F0FF] border border-[#00F0FF]/40 font-bold"
                    : "text-[#9BA3AF] hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>📊 Biometrik & Profil Atlet</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("medical")}
                className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "medical"
                    ? "bg-[#1C212E] text-[#D4FF00] border border-[#D4FF00]/40 font-bold"
                    : "text-[#9BA3AF] hover:text-white"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>🏥 Prosedur & Catatan Medis</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 rounded-sm bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-300 font-mono">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan: </span>
                    {errorMsg}
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 rounded-sm bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-300 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Berhasil: </span>
                    {successMsg}
                  </div>
                </div>
              )}

              {/* TAB 1: BIOMETRICS & PROFILE */}
              {activeTab === "biometrics" && (
                <div className="space-y-3.5 font-mono">
                  {/* Athlete Name & Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1">
                        Nama Atlet
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Atlet"
                        className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1">
                        Usia (Tahun)
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="90"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                        required
                      />
                    </div>
                  </div>

                  {/* Biometric Triad: RHR, Height, Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Resting Heart Rate */}
                    <div>
                      <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#FF2A6D]">
                          <Heart className="w-3 h-3 fill-[#FF2A6D]/20" />
                          <span>Resting HR</span>
                        </span>
                        <span className="text-[10px] text-[#5A6272]">bpm</span>
                      </label>
                      <input
                        type="number"
                        min="35"
                        max="120"
                        value={restingHr}
                        onChange={(e) => setRestingHr(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#FF2A6D]"
                        required
                      />
                      <span className="text-[9px] text-[#5A6272] mt-0.5 block">
                        Detak jantung bangun pagi
                      </span>
                    </div>

                    {/* Height */}
                    <div>
                      <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
                        <span className="text-[#00F0FF]">Tinggi Badan</span>
                        <span className="text-[10px] text-[#5A6272]">cm</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="100"
                        max="240"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                        required
                      />
                      <span className="text-[9px] text-[#5A6272] mt-0.5 block">
                        Postur tubuh atlet
                      </span>
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-[11px] text-[#9BA3AF] uppercase mb-1 flex items-center justify-between">
                        <span className="text-[#D4FF00]">Berat Badan</span>
                        <span className="text-[10px] text-[#5A6272]">kg</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="30"
                        max="200"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs font-tabular text-[#F0F2F5] focus:outline-none focus:border-[#D4FF00]"
                        required
                      />
                      <span className="text-[9px] text-[#5A6272] mt-0.5 block">
                        Bobot aktif saat ini
                      </span>
                    </div>
                  </div>

                  {/* Live Dynamic BMI Banner */}
                  <div className="p-3 rounded-sm bg-[#12151D] border border-[#1F2430] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#5A6272] uppercase block">
                        Body Mass Index (BMI) Terhitung
                      </span>
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-xl font-bold font-tabular text-[#10B981]">
                          {calculatedBmi}
                        </span>
                        <span className="text-xs text-[#9BA3AF]">
                          kg/m²
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-xs bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold">
                        {parseFloat(calculatedBmi) < 18.5
                          ? "Kategori: Berat Kurang"
                          : parseFloat(calculatedBmi) <= 24.9
                          ? "Kategori: Normal / Ideal"
                          : "Kategori: Kelebihan Bobot"}
                      </span>
                    </div>
                  </div>

                  {/* Training Days Availability */}
                  <div className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-2">
                    <label className="text-xs font-bold text-[#F0F2F5] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                      KETERSEDIAAN HARI LATIHAN MINGGUAN
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 4, 5].map((days) => (
                        <button
                          type="button"
                          key={days}
                          onClick={() => setTrainingDays(days)}
                          className={`py-2 rounded-sm text-xs font-bold transition-colors ${
                            trainingDays === days
                              ? "bg-[#00F0FF] text-black font-extrabold shadow-sm"
                              : "bg-[#090A0F] border border-[#1F2430] text-[#9BA3AF] hover:text-white"
                          }`}
                        >
                          {days} Sesi / Minggu
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#9BA3AF] leading-relaxed pt-1">
                      Program 12-Minggu diselaraskan untuk 3 sesi utama: <strong>Selasa</strong> (Easy), <strong>Jumat</strong> (Recovery), dan <strong>Minggu</strong> (Long Endurance). Senin & Kamis tetap dialokasikan istirahat penuh untuk puasa sunnah.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDICAL PROCEDURES & CLINICAL ASSESSMENTS */}
              {activeTab === "medical" && (
                <div className="space-y-4 font-mono">
                  {/* Status Overview of Joint History */}
                  <div className="p-3.5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-[#1F2430]">
                      <span className="text-xs font-bold text-[#F0F2F5] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                        STATUS PEMERIKSAAN KLINIS SENDI SAAT INI
                      </span>
                      <span className="text-[10px] text-[#5A6272]">Audit Klinis</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Right Ankle Evaluation Status */}
                      <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] space-y-1.5">
                        <span className="text-[10px] text-[#5A6272] uppercase block">
                          Pergelangan Kaki Kanan (Ankle Sprain History)
                        </span>
                        <select
                          value={ankleStatus}
                          onChange={(e) => setAnkleStatus(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xs bg-[#12151D] border border-[#1F2430] text-xs text-[#00F0FF] font-semibold focus:outline-none"
                        >
                          <option value="PENDING_CLINICAL_ASSESSMENT">
                            Belum Diperiksa (PENDING)
                          </option>
                          <option value="CLINICALLY_ASSESSED">
                            Telah Diperiksa Fisioterapis
                          </option>
                          <option value="UNDER_TREATMENT">
                            Dalam Program Terapi / Rehab
                          </option>
                          <option value="DISCHARGED_CLEARED">
                            Dinyatakan Bebas Cedera (CLEARED)
                          </option>
                        </select>
                      </div>

                      {/* Bilateral Knees Evaluation Status */}
                      <div className="p-2.5 rounded-sm bg-[#090A0F] border border-[#1F2430] space-y-1.5">
                        <span className="text-[10px] text-[#5A6272] uppercase block">
                          Kedua Tempurung Lutut (Bilateral Knees)
                        </span>
                        <select
                          value={kneeStatus}
                          onChange={(e) => setKneeStatus(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xs bg-[#12151D] border border-[#1F2430] text-xs text-[#00F0FF] font-semibold focus:outline-none"
                        >
                          <option value="PENDING_CLINICAL_ASSESSMENT">
                            Belum Diperiksa (PENDING)
                          </option>
                          <option value="CLINICALLY_ASSESSED">
                            Telah Diperiksa Fisioterapis
                          </option>
                          <option value="UNDER_TREATMENT">
                            Dalam Program Terapi / Rehab
                          </option>
                          <option value="DISCHARGED_CLEARED">
                            Dinyatakan Bebas Cedera (CLEARED)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Add New Medical Procedure / Assessment Form */}
                  <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasNewProcedure}
                          onChange={(e) => setHasNewProcedure(e.target.checked)}
                          className="accent-[#00F0FF] rounded-none w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#F0F2F5]">
                          + Catat Prosedur / Pemeriksaan Medis Baru
                        </span>
                      </label>
                      <span className="text-[10px] text-[#5A6272]">
                        Fisioterapi & Dokter Olahraga
                      </span>
                    </div>

                    {hasNewProcedure && (
                      <div className="space-y-3 pt-2 border-t border-[#1F2430] text-xs animate-in fade-in duration-150">
                        {/* Date & Provider Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                              Tanggal Prosedur / Pemeriksaan
                            </label>
                            <input
                              type="date"
                              value={procedureDate}
                              onChange={(e) => setProcedureDate(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                              required={hasNewProcedure}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                              Tenaga Medis / Pemeriksa
                            </label>
                            <select
                              value={providerType}
                              onChange={(e) => setProviderType(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                            >
                              <option value="Physiotherapist">Fisioterapis Olahraga</option>
                              <option value="Sports Medicine Physician">Dokter Spesialis Kedokteran Olahraga (Sp.KO)</option>
                              <option value="Orthopedic Surgeon">Dokter Spesialis Ortopedi (Sp.OT)</option>
                              <option value="General Practitioner">Dokter Umum</option>
                            </select>
                          </div>
                        </div>

                        {/* Provider Name */}
                        <div>
                          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                            Nama Dokter / Klinik / Rumah Sakit
                          </label>
                          <input
                            type="text"
                            value={providerName}
                            onChange={(e) => setProviderName(e.target.value)}
                            placeholder="Contoh: Klinik Fisioterapi Olahraga Sehat / dr. Pratama Sp.KO"
                            className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                          />
                        </div>

                        {/* Procedure / Treatment Details */}
                        <div>
                          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                            Tindakan / Prosedur Terapi yang Dijalani
                          </label>
                          <textarea
                            rows={2}
                            value={procedureDetails}
                            onChange={(e) => setProcedureDetails(e.target.value)}
                            placeholder="Contoh: Ultrasound modalitas 3 MHz, TENS pergelangan kaki, manual mobilization, penguatan eksentrik betis dan isometric quad setting."
                            className="w-full px-3 py-2 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                          />
                        </div>

                        {/* Clinical Findings */}
                        <div>
                          <label className="block text-[10px] text-[#9BA3AF] uppercase mb-1">
                            Hasil Temuan Klinis & Rekomendasi
                          </label>
                          <input
                            type="text"
                            value={clinicalFindings}
                            onChange={(e) => setClinicalFindings(e.target.value)}
                            placeholder="Contoh: Stabilitas ligamen ATFL baik, tidak ada efusi lutut. Boleh bersepeda Zone 2."
                            className="w-full px-3 py-1.5 rounded-sm bg-[#090A0F] border border-[#1F2430] text-xs text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
                          />
                        </div>

                        {/* Return-to-Run Medical Clearance Toggle */}
                        <div className="p-3 rounded-sm bg-[#090A0F] border border-[#1F2430] flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#F0F2F5] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
                              Izin Medis Resmi Kembali Berlari (Medical Clearance)
                            </span>
                            <p className="text-[10px] text-[#9BA3AF] pt-0.5">
                              Aktifkan hanya jika dokter/fisioterapis telah memberikan izin formal untuk memulai lari bertahap.
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={clearanceGranted}
                              onChange={(e) => setClearanceGranted(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-[#1F2430] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Historical Medical Assessments */}
                  {healthContext && healthContext.medicalAssessments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] text-[#5A6272] uppercase block">
                        Riwayat Prosedur & Asesmen Tercatat ({healthContext.medicalAssessments.length})
                      </span>
                      <div className="space-y-1.5">
                        {healthContext.medicalAssessments.map((m) => (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-sm bg-[#12151D] border border-[#1F2430] text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#F0F2F5]">
                                {m.provider_name || m.healthcare_provider_type}
                              </span>
                              <span className="text-[10px] text-[#00F0FF] font-tabular">
                                {m.assessment_date}
                              </span>
                            </div>
                            {m.rehabilitation_protocol && (
                              <p className="text-[11px] text-[#9BA3AF]">
                                <strong>Tindakan:</strong> {m.rehabilitation_protocol}
                              </p>
                            )}
                            <p className="text-[10px] text-[#5A6272]">
                              Temuan: {m.clinical_findings}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit & Cancel Actions */}
              <div className="pt-2 border-t border-[#1F2430] flex items-center justify-end gap-2.5 font-mono">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-sm text-xs font-medium text-[#9BA3AF] hover:text-white hover:bg-[#161922] transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-sm bg-[#00F0FF] hover:bg-[#00d8e6] text-[#090A0F] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#00F0FF]/10 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>SIMPAN PERUBAHAN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
