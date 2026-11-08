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
  Sparkles,
} from "lucide-react";

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

  // Identity Form State
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [experience, setExperience] = useState(profile?.training_experience || "INTERMEDIATE");
  const [objectives, setObjectives] = useState(
    profile?.performance_objectives || "Aerobic endurance maintenance with safe multi-sport progression"
  );
  const [sports, setSports] = useState<string[]>(profile?.preferred_sports || ["Running", "Cycling"]);

  // Biometrics Form State
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "22");
  const [heightCm, setHeightCm] = useState(
    user.height_cm ? String(user.height_cm) : profile?.height_cm ? String(profile.height_cm) : "170"
  );
  const [weightKg, setWeightKg] = useState(
    user.weight_kg ? String(user.weight_kg) : profile?.weight_kg ? String(profile.weight_kg) : "65"
  );
  const [rhr, setRhr] = useState(
    user.resting_heart_rate ? String(user.resting_heart_rate) : profile?.resting_heart_rate ? String(profile.resting_heart_rate) : "68"
  );
  const [maxHr, setMaxHr] = useState(user.max_heart_rate ? String(user.max_heart_rate) : "188");
  const [trainingDays, setTrainingDays] = useState(
    profile?.training_days_per_week ? String(profile.training_days_per_week) : "3"
  );

  // Physiology Form State
  const physio = (profile?.physiological_measurements || {}) as Partial<PhysiologicalMeasurements>;
  const [ftpWatts, setFtpWatts] = useState(physio.ftp_watts ? String(physio.ftp_watts) : "165");
  const [vo2Max, setVo2Max] = useState(physio.vo2_max ? String(physio.vo2_max) : "48.5");
  const [thresholdPaceMin, setThresholdPaceMin] = useState("5");
  const [thresholdPaceSec, setThresholdPaceSec] = useState("15");

  if (!isOpen) return null;

  // Live BMI calculation
  const hNum = Number(heightCm) || 170;
  const wNum = Number(weightKg) || 65;
  const liveBmi = Math.round((wNum / Math.pow(hNum / 100, 2)) * 10) / 10;

  // Live W/kg
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
          user_id: user.id,
          name: name.trim(),
          avatar_url: avatarUrl.trim() || null,
          age: Number(age) || 22,
          height_cm: Number(heightCm) || 170,
          weight_kg: Number(weightKg) || 65,
          resting_heart_rate: Number(rhr) || 68,
          max_heart_rate: Number(maxHr) || 188,
          training_days_per_week: Number(trainingDays) || 3,
          preferred_sports: sports,
          training_experience: experience,
          performance_objectives: objectives.trim(),
          physiological_measurements: {
            ftp_watts: Number(ftpWatts) || null,
            vo2_max: Number(vo2Max) || null,
            running_threshold_pace_sec: paceTotalSec,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gagal menyimpan profil atlet");
      }

      setStatusMessage({ type: "success", text: "Profil atlet berhasil diperbarui dan dikalibrasi!" });
      if (onProfileUpdated && data.user && data.profile) {
        onProfileUpdated({ user: data.user, profile: data.profile });
      }

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Terjadi kesalahan sistem saat menyimpan data." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--color-text-primary)]">
                Kalibrasi Profil Atlet &amp; Biometrik
              </h2>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] block">
                Pembaruan Otoritatif Metrik Fisik &amp; Kapasitas Fisiologis
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
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

          {/* TAB 1: IDENTITAS */}
          {activeTab === "identity" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                  Nama Atlet *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Atlet"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                  URL Foto Profil (Avatar)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Tingkat Pengalaman Latihan
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  >
                    <option value="BEGINNER">BEGINNER (0 - 1 Tahun)</option>
                    <option value="INTERMEDIATE">INTERMEDIATE (1 - 3 Tahun)</option>
                    <option value="ADVANCED">ADVANCED (3 - 5+ Tahun)</option>
                    <option value="ELITE">ELITE (Kompetitif / Atlet Nasional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Disiplin Pilihan
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {["Running", "Cycling", "Strength", "Swimming"].map((sp) => {
                      const selected = sports.includes(sp);
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => toggleSport(sp)}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer ${
                            selected
                              ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/40 font-bold"
                              : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                          }`}
                        >
                          {sp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                  Sasaran / Objektif Musim Latihan
                </label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Contoh: Pemeliharaan endurance aerobik dengan pencegahan cedera lutut..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: BIOMETRIK */}
          {activeTab === "biometrics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Usia (Tahun)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Resting HR (bpm)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="110"
                    value={rhr}
                    onChange={(e) => setRhr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Max HR (bpm)
                  </label>
                  <input
                    type="number"
                    min="140"
                    max="220"
                    value={maxHr}
                    onChange={(e) => setMaxHr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Hari Latihan / Minggu
                  </label>
                  <select
                    value={trainingDays}
                    onChange={(e) => setTrainingDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  >
                    <option value="2">2 Hari / Minggu</option>
                    <option value="3">3 Hari / Minggu (Rekomendasi Pemulihan)</option>
                    <option value="4">4 Hari / Minggu</option>
                    <option value="5">5 Hari / Minggu</option>
                    <option value="6">6 Hari / Minggu</option>
                  </select>
                </div>
              </div>

              {/* Live Calculated BMI Callout */}
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-muted)]/60 border border-[var(--color-border)] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                    Kalkulasi BMI Real-Time
                  </span>
                  <span className="text-sm font-bold text-[var(--color-cycling)]">
                    {liveBmi} kg/m² • {liveBmi <= 24.9 ? "Ideal Atletik" : "Di Luar Batas Standar"}
                  </span>
                </div>
                <div className="text-right text-[10.5px] text-[var(--color-text-muted)]">
                  HR Reserve: <strong className="text-[var(--color-text-primary)]">{(Number(maxHr) || 188) - (Number(rhr) || 68)} bpm</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FISIOLOGI */}
          {activeTab === "physiology" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Functional Threshold Power (FTP Watts)
                  </label>
                  <input
                    type="number"
                    value={ftpWatts}
                    onChange={(e) => setFtpWatts(e.target.value)}
                    placeholder="165"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                  {liveWkg && (
                    <span className="text-[10px] font-mono text-[var(--color-cycling)] block mt-1">
                      Kalkulasi: {liveWkg} W/kg rasio daya
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                    Estimasi VO2 Max (ml/kg/min)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vo2Max}
                    onChange={(e) => setVo2Max(e.target.value)}
                    placeholder="48.5"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] block mt-1">
                    Standar aerobik multi-sport
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] uppercase font-bold text-[var(--color-text-muted)] mb-1">
                  Ambang Laju Lari (Running Threshold Pace)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={thresholdPaceMin}
                    onChange={(e) => setThresholdPaceMin(e.target.value)}
                    className="w-20 px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                  <span className="text-sm font-bold">:</span>
                  <input
                    type="number"
                    value={thresholdPaceSec}
                    onChange={(e) => setThresholdPaceSec(e.target.value)}
                    className="w-20 px-3 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-cycling)]"
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">/km</span>
                </div>
              </div>
            </div>
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
