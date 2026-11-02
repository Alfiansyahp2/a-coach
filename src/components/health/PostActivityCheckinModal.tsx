"use client";

import React, { useState } from "react";
import { Activity } from "@/types";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Activity as ActivityIcon,
  ShieldAlert,
  Save,
} from "lucide-react";

interface PostActivityCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentActivities: Activity[];
  onCheckinSuccess?: () => void;
}

export function PostActivityCheckinModal({
  isOpen,
  onClose,
  recentActivities,
  onCheckinSuccess,
}: PostActivityCheckinModalProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    recentActivities[0]?.id || ""
  );
  const [sportType, setSportType] = useState<string>(
    recentActivities[0]?.sport_type || "Run"
  );
  const [distanceKm, setDistanceKm] = useState<number>(
    recentActivities[0]
      ? Math.round((recentActivities[0].distance_meters / 1000) * 100) / 100
      : 5.0
  );
  const [durationSec, setDurationSec] = useState<number>(
    recentActivities[0]?.moving_time_seconds || 1800
  );

  const [painDuring, setPainDuring] = useState<number>(0);
  const [painAfter, setPainAfter] = useState<number>(0);
  const [painNextDay, setPainNextDay] = useState<number>(0);
  const [swelling, setSwelling] = useState<boolean>(false);
  const [instability, setInstability] = useState<boolean>(false);
  const [rpe, setRpe] = useState<number>(6.0);
  const [comments, setComments] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleActivitySelect = (actId: string) => {
    setSelectedActivityId(actId);
    const act = recentActivities.find((a) => a.id === actId);
    if (act) {
      setSportType(act.sport_type);
      setDistanceKm(Math.round((act.distance_meters / 1000) * 100) / 100);
      setDurationSec(act.moving_time_seconds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/athlete/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: selectedActivityId || null,
          sport_type: sportType,
          distance_km: distanceKm,
          duration_seconds: durationSec,
          pain_during_activity: painDuring,
          pain_after_activity: painAfter,
          pain_next_day: painNextDay,
          swelling_observed: swelling,
          instability_observed: instability,
          rpe_score: rpe,
          athlete_comments: comments,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Check-in failed");
      }

      setStatusMessage({
        type: "success",
        text: "Check-in recorded! Sport-specific training readiness deterministically updated.",
      });

      setTimeout(() => {
        if (onCheckinSuccess) onCheckinSuccess();
        onClose();
        // Trigger page refresh to update server components
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to submit check-in",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#12151D] border border-[#1F2430] rounded-sm max-w-xl w-full p-5 space-y-4 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#00F0FF]">
              <ActivityIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[#F0F2F5]">
                Post-Activity Subjective Check-in
              </h3>
              <span className="text-[10px] font-mono text-[#5A6272]">
                Symptom Ingestion & Deterministic Readiness Update
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-sm bg-[#161922] border border-[#1F2430] flex items-center justify-center text-[#9BA3AF] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clinical Safety Alert Banner */}
        <div className="p-3 rounded-sm bg-[#161922] border border-[#FF2A6D]/30 flex items-start gap-2.5 text-[11px] font-mono text-[#9BA3AF]">
          <ShieldAlert className="w-4 h-4 text-[#FF2A6D] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[#F0F2F5]">Safety Protocol:</strong> Data reported here directly gates future workout prescriptions. If you experience acute swelling, joint giving-way, or sharp weight-bearing pain, stop activity and seek medical evaluation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Activity Selection */}
          {recentActivities.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase font-semibold text-[#9BA3AF] mb-1">
                Link to Ingested Activity
              </label>
              <select
                value={selectedActivityId}
                onChange={(e) => handleActivitySelect(e.target.value)}
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1.5 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              >
                {recentActivities.slice(0, 8).map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name} ({act.sport_type} • {(act.distance_meters / 1000).toFixed(1)} km)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pain Telemetry Grid */}
          <div className="p-3 bg-[#090A0F] border border-[#1F2430] rounded-sm space-y-3">
            <span className="text-[10px] uppercase font-bold text-[#F0F2F5] tracking-wider block">
              1. Pain Scale Telemetry (0 = None, 10 = Severe)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[#9BA3AF] mb-1">
                  During Activity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painDuring}
                    onChange={(e) => setPainDuring(Number(e.target.value))}
                    className="w-full accent-[#00F0FF]"
                  />
                  <span className={`font-bold font-tabular text-sm w-5 text-right ${painDuring > 0 ? "text-[#FF2A6D]" : "text-[#10B981]"}`}>
                    {painDuring}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9BA3AF] mb-1">
                  Immediately After
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painAfter}
                    onChange={(e) => setPainAfter(Number(e.target.value))}
                    className="w-full accent-[#00F0FF]"
                  />
                  <span className={`font-bold font-tabular text-sm w-5 text-right ${painAfter > 0 ? "text-[#FF2A6D]" : "text-[#10B981]"}`}>
                    {painAfter}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9BA3AF] mb-1">
                  Next-Day / Morning
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painNextDay}
                    onChange={(e) => setPainNextDay(Number(e.target.value))}
                    className="w-full accent-[#00F0FF]"
                  />
                  <span className={`font-bold font-tabular text-sm w-5 text-right ${painNextDay > 0 ? "text-[#FF2A6D]" : "text-[#10B981]"}`}>
                    {painNextDay}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Biological Circuit Breakers (Swelling & Instability) */}
          <div className="p-3 bg-[#090A0F] border border-[#1F2430] rounded-sm space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-[#F0F2F5] tracking-wider block">
              2. Structural Symptoms & Circuit Breakers
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-2 rounded-sm bg-[#161922] border border-[#1F2430] cursor-pointer hover:border-[#2D3547]">
                <span className="text-[11px] text-[#F0F2F5]">
                  Joint Swelling Observed?
                </span>
                <input
                  type="checkbox"
                  checked={swelling}
                  onChange={(e) => setSwelling(e.target.checked)}
                  className="w-4 h-4 accent-[#FF2A6D]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-sm bg-[#161922] border border-[#1F2430] cursor-pointer hover:border-[#2D3547]">
                <span className="text-[11px] text-[#F0F2F5]">
                  Joint Instability / Giving Way?
                </span>
                <input
                  type="checkbox"
                  checked={instability}
                  onChange={(e) => setInstability(e.target.checked)}
                  className="w-4 h-4 accent-[#FF2A6D]"
                />
              </label>
            </div>
          </div>

          {/* RPE & Subjective Comments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[10px] text-[#9BA3AF] mb-1">
                Perceived Exertion (RPE 1-10)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1 text-[#00F0FF] font-bold font-tabular focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] text-[#9BA3AF] mb-1">
                Subjective Athlete Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Ankle felt stable during flat spin, slight knee stiffness on stairs"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-1 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-sm border text-[11px] flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40"
                  : "bg-[#FF2A6D]/15 text-[#FF2A6D] border-[#FF2A6D]/40"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F2430]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] text-[#9BA3AF] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-sm bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-semibold hover:bg-[#00F0FF]/25 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? "Evaluating Readiness..." : "Save Check-in & Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

