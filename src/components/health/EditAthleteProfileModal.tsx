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
          throw new Error(`Respon server medis tidak valid (${medRes.status})`);
        }

        if (!medRes.ok || !medData.success) {
          throw new Error(medData.error || medData.message || "Gagal menyimpan prosedur medis.");
        }
        medUpdated = true;
      }

      setSuccessMsg(
        medUpdated
          ? "Biometrik & prosedur medis atlet berhasil diperbarui secara authoritative!"
          : "Biometrik dasar atlet berhasil diperbarui!"
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
          className="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] transition-all font-mono text-xs cursor-pointer shadow-xs"
        >
          {/* Resting Heart Rate Indicator */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[var(--color-alert-red)] fill-[var(--color-alert-red)]/20 animate-pulse" />
            <span className="font-bold font-tabular text-[var(--color-alert-red)]">
              {user?.resting_heart_rate || profile?.resting_heart_rate || 68}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">bpm RHR</span>
          </div>

          <span className="text-[var(--color-border)]">|</span>

          {/* Height */}
          <div className="flex items-center gap-1">
            <span className="font-bold font-tabular text-[var(--color-text-primary)]">
              {user?.height_cm || profile?.height_cm || 170}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">cm</span>
          </div>

          <span className="text-[var(--color-border)]">|</span>

          {/* Weight */}
          <div className="flex items-center gap-1">
            <span className="font-bold font-tabular text-[var(--color-text-primary)]">
              {user?.weight_kg || profile?.weight_kg || 65}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">kg</span>
          </div>

          <span className="text-[var(--color-border)]">|</span>

          {/* BMI */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--color-text-muted)]">BMI</span>
            <span className="font-bold font-tabular text-[var(--color-cycling)]">
              {profile?.bmi || 22.5}
            </span>
          </div>

          {/* Edit Pencil Icon Tooltip */}
          <div className="ml-1 pl-1 border-l border-[var(--color-border)] text-[var(--color-text-muted)] group-hover:text-[var(--color-cycling)] transition-colors">
            <Pencil className="w-3 h-3" />
          </div>
        </button>
      )}

      {/* TRIGGER VARIANT: DEDICATED BUTTON */}
      {variant === "button" && (
        <button
          onClick={handleOpen}
          type="button"
          className="px-3.5 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>EDIT PROFIL &amp; PROSEDUR MEDIS</span>
        </button>
      )}

      {/* MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-cycling)]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
                    EDIT PROFIL &amp; PROSEDUR KESEHATAN
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 border border-[var(--color-cycling)]/30 text-[var(--color-cycling)]">
                      Calibrated Baseline
                    </span>
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                    Kalibrasi biometrik dasar (RHR, TB, BB) dan riwayat prosedur medis / fisioterapi.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)] border border-transparent hover:border-[var(--color-border)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="px-5 pt-3 pb-2 bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("biometrics")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "biometrics"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                <span>Biometrik &amp; Profil Atlet</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("medical")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  activeTab === "medical"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-[var(--color-running)]" />
                <span>Prosedur &amp; Catatan Medis</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 rounded-md bg-[var(--color-alert-red)]/10 border border-[var(--color-alert-red)]/30 flex items-start gap-2.5 text-xs text-[var(--color-alert-red)] font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan: </span>
                    {errorMsg}
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 rounded-md bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 flex items-start gap-2.5 text-xs text-[var(--color-cycling)] font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
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
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5 font-mono">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-md bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
