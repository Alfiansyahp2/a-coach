"use client";

import React, { useState } from "react";
import { User, AthleteProfile, PhysiologicalMeasurements } from "@/types";
import {
  X,
  User as UserIcon,
  Activity,
  Zap,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { EditProfileIdentityTab } from "./tabs/EditProfileIdentityTab";
import { EditProfileBiometricsTab } from "./tabs/EditProfileBiometricsTab";
import { EditProfilePhysiologyTab } from "./tabs/EditProfilePhysiologyTab";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profile: AthleteProfile | null;
  onProfileUpdated?: (updated: { user: User; profile: AthleteProfile }) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  profile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"identity" | "biometrics" | "physiology">("identity");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form States
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [experience, setExperience] = useState(profile?.training_experience || "INTERMEDIATE");
  const [objectives, setObjectives] = useState(profile?.performance_objectives || "Aerobic endurance maintenance with safe multi-sport progression");
  const [sports, setSports] = useState<string[]>(profile?.preferred_sports || ["Running", "Cycling"]);
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "22");
  const [heightCm, setHeightCm] = useState(user.height_cm ? String(user.height_cm) : profile?.height_cm ? String(profile.height_cm) : "170");
  const [weightKg, setWeightKg] = useState(user.weight_kg ? String(user.weight_kg) : profile?.weight_kg ? String(profile.weight_kg) : "65");
  const [rhr, setRhr] = useState(user.resting_heart_rate ? String(user.resting_heart_rate) : profile?.resting_heart_rate ? String(profile.resting_heart_rate) : "68");
  const [maxHr, setMaxHr] = useState(user.max_heart_rate ? String(user.max_heart_rate) : "188");
  const [trainingDays, setTrainingDays] = useState(profile?.training_days_per_week ? String(profile.training_days_per_week) : "3");
  const physio = (profile?.physiological_measurements || {}) as Partial<PhysiologicalMeasurements>;
  const [ftpWatts, setFtpWatts] = useState(physio.ftp_watts ? String(physio.ftp_watts) : "165");
  const [vo2Max, setVo2Max] = useState(physio.vo2_max ? String(physio.vo2_max) : "48.5");
  const [thresholdPaceMin, setThresholdPaceMin] = useState("5");
  const [thresholdPaceSec, setThresholdPaceSec] = useState("15");

  if (!isOpen) return null;

  const hNum = Number(heightCm) || 170;
  const wNum = Number(weightKg) || 65;
  const liveBmi = Math.round((wNum / Math.pow(hNum / 100, 2)) * 10) / 10;
  const ftpNum = Number(ftpWatts) || 0;
  const liveWkg = wNum > 0 && ftpNum > 0 ? (ftpNum / wNum).toFixed(2) : null;

  const toggleSport = (sport: string) => {
    if (sports.includes(sport)) {
      if (sports.length > 1) {
        setSports(sports.filter((s) => s !== sport));
      }
    } else {
      setSports([...sports, sport]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const paceTotalSec = (Number(thresholdPaceMin) || 5) * 60 + (Number(thresholdPaceSec) || 0);

      const res = await fetch("/api/athlete/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatar_url: avatarUrl,
          age: Number(age) || 22,
          height_cm: Number(heightCm) || 170,
          weight_kg: Number(weightKg) || 65,
          resting_heart_rate: Number(rhr) || 68,
          max_heart_rate: Number(maxHr) || 188,
          training_experience: experience,
          training_days_per_week: Number(trainingDays) || 3,
          preferred_sports: sports,
          performance_objectives: objectives,
          physiological_measurements: {
            ...physio,
            ftp_watts: Number(ftpWatts) || 165,
            vo2_max: Number(vo2Max) || 48.5,
            running_threshold_pace_sec: paceTotalSec,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui profil atlet");
      }

      setStatusMessage({ type: "success", text: "Profil atlet berhasil diperbarui!" });
      if (onProfileUpdated && data.data) {
        onProfileUpdated(data.data);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Terjadi kesalahan sistem." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--color-border)] font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Pengaturan Profil Atlet
              </h2>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Parameter biometrik &amp; fisiologis telemetri
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-2 border-b border-[var(--color-border)] bg-[var(--color-surface-card)] text-xs font-mono shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "identity"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Identitas Atlet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("biometrics")}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "biometrics"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Biometrik &amp; HR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("physiology")}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "physiology"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-bold shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[var(--color-running)]" />
            <span>Fisiologi &amp; Daya</span>
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                statusMessage.type === "success"
                  ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                  : "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/30"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === "identity" && (
            <EditProfileIdentityTab
              name={name}
              setName={setName}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              experience={experience}
              setExperience={setExperience}
              sports={sports}
              toggleSport={toggleSport}
              objectives={objectives}
              setObjectives={setObjectives}
            />
          )}

          {activeTab === "biometrics" && (
            <EditProfileBiometricsTab
              age={age}
              setAge={setAge}
              heightCm={heightCm}
              setHeightCm={setHeightCm}
              weightKg={weightKg}
              setWeightKg={setWeightKg}
              rhr={rhr}
              setRhr={setRhr}
              maxHr={maxHr}
              setMaxHr={setMaxHr}
              trainingDays={trainingDays}
              setTrainingDays={setTrainingDays}
              liveBmi={liveBmi}
            />
          )}

          {activeTab === "physiology" && (
            <EditProfilePhysiologyTab
              ftpWatts={ftpWatts}
              setFtpWatts={setFtpWatts}
              liveWkg={liveWkg}
              vo2Max={vo2Max}
              setVo2Max={setVo2Max}
              thresholdPaceMin={thresholdPaceMin}
              setThresholdPaceMin={setThresholdPaceMin}
              thresholdPaceSec={thresholdPaceSec}
              setThresholdPaceSec={setThresholdPaceSec}
            />
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[var(--color-cycling)] text-[var(--color-canvas)] font-bold text-xs flex items-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
