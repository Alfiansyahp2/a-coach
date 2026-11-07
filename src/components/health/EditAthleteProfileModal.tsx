"use client";

import React from "react";
import { User, AthleteProfile, AuthoritativeAthleteHealthContext } from "@/types";
import {
  Heart,
  Pencil,
  X,
  User as UserIcon,
  Activity,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Save,
  RefreshCw,
} from "lucide-react";
import { ProfileBiometricsTab } from "./profile/ProfileBiometricsTab";
import { ProfileMedicalProceduresTab } from "./profile/ProfileMedicalProceduresTab";
import { useAthleteProfileForm } from "./useAthleteProfileForm";

interface EditAthleteProfileModalProps {
  user?: User | null;
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
  const form = useAthleteProfileForm({
    user,
    profile,
    healthContext,
  });

  return (
    <>
      {/* TRIGGER VARIANT: COMPACT BADGE IN HEADER */}
      {variant === "badge" && (
        <button
          onClick={form.handleOpen}
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
          onClick={form.handleOpen}
          type="button"
          className="px-3.5 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] text-[var(--color-text-primary)] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
          <span>EDIT PROFIL &amp; PROSEDUR MEDIS</span>
        </button>
      )}

      {/* MODAL DIALOG */}
      {form.isOpen && (
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
                onClick={form.handleClose}
                disabled={form.isSubmitting}
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-card)] border border-transparent hover:border-[var(--color-border)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="px-5 pt-3 pb-2 bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => form.setActiveTab("biometrics")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  form.activeTab === "biometrics"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                <span>Biometrik &amp; Profil Atlet</span>
              </button>
              <button
                type="button"
                onClick={() => form.setActiveTab("medical")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                  form.activeTab === "medical"
                    ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-[var(--color-running)]" />
                <span>Prosedur &amp; Catatan Medis</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={form.handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Error Banner */}
              {form.errorMsg && (
                <div className="p-3 rounded-md bg-[var(--color-alert-red)]/10 border border-[var(--color-alert-red)]/30 flex items-start gap-2.5 text-xs text-[var(--color-alert-red)] font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan: </span>
                    {form.errorMsg}
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {form.successMsg && (
                <div className="p-3 rounded-md bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 flex items-start gap-2.5 text-xs text-[var(--color-cycling)] font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Berhasil: </span>
                    {form.successMsg}
                  </div>
                </div>
              )}

              {/* TAB 1: BIOMETRICS & PROFILE */}
              {form.activeTab === "biometrics" && (
                <ProfileBiometricsTab
                  name={form.name}
                  setName={form.setName}
                  age={form.age}
                  setAge={form.setAge}
                  restingHr={form.restingHr}
                  setRestingHr={form.setRestingHr}
                  heightCm={form.heightCm}
                  setHeightCm={form.setHeightCm}
                  weightKg={form.weightKg}
                  setWeightKg={form.setWeightKg}
                  calculatedBmi={form.calculatedBmi}
                  trainingDays={form.trainingDays}
                  setTrainingDays={form.setTrainingDays}
                />
              )}

              {/* TAB 2: MEDICAL PROCEDURES & CLINICAL ASSESSMENTS */}
              {form.activeTab === "medical" && (
                <ProfileMedicalProceduresTab
                  healthContext={healthContext}
                  ankleStatus={form.ankleStatus}
                  setAnkleStatus={form.setAnkleStatus}
                  kneeStatus={form.kneeStatus}
                  setKneeStatus={form.setKneeStatus}
                  hasNewProcedure={form.hasNewProcedure}
                  setHasNewProcedure={form.setHasNewProcedure}
                  procedureDate={form.procedureDate}
                  setProcedureDate={form.setProcedureDate}
                  providerType={form.providerType}
                  setProviderType={form.setProviderType}
                  providerName={form.providerName}
                  setProviderName={form.setProviderName}
                  procedureDetails={form.procedureDetails}
                  setProcedureDetails={form.setProcedureDetails}
                  clinicalFindings={form.clinicalFindings}
                  setClinicalFindings={form.setClinicalFindings}
                  clearanceGranted={form.clearanceGranted}
                  setClearanceGranted={form.setClearanceGranted}
                />
              )}

              {/* Submit & Cancel Actions */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5 font-mono">
                <button
                  type="button"
                  onClick={form.handleClose}
                  disabled={form.isSubmitting}
                  className="px-4 py-2 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={form.isSubmitting}
                  className="px-5 py-2 rounded-md bg-[var(--color-cycling)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {form.isSubmitting ? (
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
