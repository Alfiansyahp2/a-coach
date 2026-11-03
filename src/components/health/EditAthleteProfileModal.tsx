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
  RefreshCw,
  User as UserIcon,
  Save,
} from "lucide-react";
import { User, AthleteProfile, AuthoritativeAthleteHealthContext } from "@/types";
import { ProfileBiometricsTab } from "./profile/ProfileBiometricsTab";
import { ProfileMedicalProceduresTab } from "./profile/ProfileMedicalProceduresTab";

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
    numericHeight > 0 && numericWeight > 0
      ? (numericWeight / ((numericHeight / 100) * (numericHeight / 100))).toFixed(1)
      : "22.5";

  const handleOpen = () => {
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
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Submit Biometric Updates
      const bioPayload = {
        name: name.trim() || undefined,
        age: parseInt(age, 10) || undefined,
        resting_heart_rate: parseInt(restingHr, 10) || undefined,
        height_cm: parseFloat(heightCm) || undefined,
        weight_kg: parseFloat(weightKg) || undefined,
        training_days_per_week: trainingDays,
      };

      const bioRes = await fetch("/api/athlete/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bioPayload),
      });

      const bioText = await bioRes.text();
      let bioData: any = {};
      try {
        bioData = bioText ? JSON.parse(bioText) : {};
      } catch {
        throw new Error(`Respon server tidak valid (${bioRes.status})`);
      }

      if (!bioRes.ok || !bioData.success) {
        throw new Error(bioData.error || bioData.message || "Gagal memperbarui biometrik atlet.");
      }

      // 2. Submit Medical Procedure if updated or recorded
      let medUpdated = false;
      if (
        hasNewProcedure ||
        ankleStatus !== (ankleInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT") ||
        kneeStatus !== (kneeInjury?.medical_evaluation_status || "PENDING_CLINICAL_ASSESSMENT")
      ) {
        const medPayload = {
          injury_id: ankleInjury?.id || kneeInjury?.id || null,
          assessment_date: procedureDate,
          healthcare_provider_type: providerType,
          provider_name: providerName.trim() || null,
          clinical_findings: clinicalFindings.trim() || "Pemeriksaan klinis berkala & monitoring toleransi sendi.",
          rehabilitation_protocol: procedureDetails.trim() || null,
          clearance_granted: clearanceGranted,
          ankle_status: ankleStatus,
          knee_status: kneeStatus,
        };

        const medRes = await fetch("/api/athlete/medical-procedure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medPayload),
        });

        const medText = await medRes.text();
        let medData: any = {};
        try {
          medData = medText ? JSON.parse(medText) : {};
        } catch {
          throw new Error(`Respon server tidak valid (${medRes.status})`);
        }

        if (!medRes.ok || !medData.success) {
          throw new Error(medData.error || medData.message || "Gagal mencatat prosedur medis.");
        }
        medUpdated = true;
      }

      setSuccessMsg(
        medUpdated
          ? "Biometrik dan catatan prosedur medis berhasil dikalibrasi! Status kesiapan latihan telah diperbarui."
          : "Biometrik profil atlet berhasil diperbarui!"
      );

      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* TRIGGER VARIANT: COMPACT BADGE IN HEADER */}
      {variant === "badge" && (
        <button
          onClick={handleOpen}
          type="button"
          title="Klik untuk kalibrasi biometrik & status kesehatan"
          className="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-[#12151D] hover:bg-[#161922] border border-[#1F2430] hover:border-[#00F0FF]/50 transition-all font-mono text-xs cursor-pointer shadow-sm"
        >
          {/* Resting Heart Rate Indicator */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#FF2A6D] fill-[#FF2A6D]/20 animate-pulse" />
            <span className="font-bold font-tabular text-[#FF2A6D]">
              {user?.resting_heart_rate || profile?.resting_heart_rate || 68}
            </span>
            <span className="text-[10px] text-[#5A6272]">bpm RHR</span>
          </div>

          <span className="text-[#2D3547]">|</span>

          {/* Height */}
          <div className="flex items-center gap-1">
            <span className="font-bold font-tabular text-[#00F0FF]">
              {user?.height_cm || profile?.height_cm || 170}
            </span>
            <span className="text-[10px] text-[#5A6272]">cm</span>
          </div>

          <span className="text-[#2D3547]">|</span>

          {/* Weight */}
          <div className="flex items-center gap-1">
            <span className="font-bold font-tabular text-[#D4FF00]">
              {user?.weight_kg || profile?.weight_kg || 65}
            </span>
            <span className="text-[10px] text-[#5A6272]">kg</span>
          </div>

          <span className="text-[#2D3547]">|</span>

          {/* BMI */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#5A6272]">BMI</span>
            <span className="font-bold font-tabular text-[#10B981]">
              {profile?.bmi || 22.5}
            </span>
          </div>

          {/* Edit Pencil Icon Tooltip */}
          <div className="ml-1 pl-1 border-l border-[#1F2430] text-[#5A6272] group-hover:text-[#00F0FF] transition-colors">
            <Pencil className="w-3 h-3" />
          </div>
        </button>
      )}

      {/* TRIGGER VARIANT: DEDICATED BUTTON */}
      {variant === "button" && (
        <button
          onClick={handleOpen}
          type="button"
          className="px-3.5 py-1.5 rounded-sm bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>EDIT PROFIL & PROSEDUR MEDIS</span>
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
                <ProfileBiometricsTab
                  name={name}
                  setName={setName}
                  age={age}
                  setAge={setAge}
                  restingHr={restingHr}
                  setRestingHr={setRestingHr}
                  heightCm={heightCm}
                  setHeightCm={setHeightCm}
                  weightKg={weightKg}
                  setWeightKg={setWeightKg}
                  calculatedBmi={calculatedBmi}
                  trainingDays={trainingDays}
                  setTrainingDays={setTrainingDays}
                />
              )}

              {/* TAB 2: MEDICAL PROCEDURES & CLINICAL ASSESSMENTS */}
              {activeTab === "medical" && (
                <ProfileMedicalProceduresTab
                  healthContext={healthContext}
                  ankleStatus={ankleStatus}
                  setAnkleStatus={setAnkleStatus}
                  kneeStatus={kneeStatus}
                  setKneeStatus={setKneeStatus}
                  hasNewProcedure={hasNewProcedure}
                  setHasNewProcedure={setHasNewProcedure}
                  procedureDate={procedureDate}
                  setProcedureDate={setProcedureDate}
                  providerType={providerType}
                  setProviderType={setProviderType}
                  providerName={providerName}
                  setProviderName={setProviderName}
                  procedureDetails={procedureDetails}
                  setProcedureDetails={setProcedureDetails}
                  clinicalFindings={clinicalFindings}
                  setClinicalFindings={setClinicalFindings}
                  clearanceGranted={clearanceGranted}
                  setClearanceGranted={setClearanceGranted}
                />
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
