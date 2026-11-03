"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Activity } from "@/types";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Activity as ActivityIcon,
  ShieldAlert,
  Save,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/formatters";

interface PostActivityCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentActivities: Activity[];
  onCheckinSuccess?: () => void;
  initialActivityId?: string;
}

export function PostActivityCheckinModal({
  isOpen,
  onClose,
  recentActivities,
  onCheckinSuccess,
  initialActivityId,
}: PostActivityCheckinModalProps) {
  // Sort activities strictly descending by start_date so the newest session is always at the very top
  const sortedActivities = useMemo(() => {
    return [...(recentActivities || [])].sort((a, b) => {
      const timeA = new Date(a.start_date).getTime();
      const timeB = new Date(b.start_date).getTime();
      return timeB - timeA;
    });
  }, [recentActivities]);

  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [sportType, setSportType] = useState<string>("Run");
  const [distanceKm, setDistanceKm] = useState<number>(5.0);
  const [durationSec, setDurationSec] = useState<number>(1800);

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

  // Sync state when modal opens or activities list updates
  useEffect(() => {
    if (isOpen && sortedActivities.length > 0) {
      const targetId =
        initialActivityId && sortedActivities.some((a) => a.id === initialActivityId)
          ? initialActivityId
          : selectedActivityId && sortedActivities.some((a) => a.id === selectedActivityId)
          ? selectedActivityId
          : sortedActivities[0]?.id || "";

      setSelectedActivityId(targetId);
      const act = sortedActivities.find((a) => a.id === targetId) || sortedActivities[0];
      if (act) {
        setSportType(act.sport_type);
        setDistanceKm(Math.round((act.distance_meters / 1000) * 100) / 100);
        setDurationSec(act.moving_time_seconds);
      }
    }
  }, [isOpen, initialActivityId, sortedActivities]);

  if (!isOpen) return null;

  const selectedActivity =
    sortedActivities.find((a) => a.id === selectedActivityId) || sortedActivities[0];

  const handleActivitySelect = (actId: string) => {
    setSelectedActivityId(actId);
    const act = sortedActivities.find((a) => a.id === actId);
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

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Respon server tidak valid (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Gagal mencatat check-in pasca sesi.");
      }

      setStatusMessage({
        type: "success",
        text: "Check-in berhasil disimpan! Kesiapan latihan multi-sport telah diperbarui.",
      });

      setTimeout(() => {
        if (onCheckinSuccess) onCheckinSuccess();
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Gagal mengirim formulir check-in.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#12151D] border border-[#1F2430] rounded-sm max-w-xl w-full p-5 space-y-4 shadow-2xl relative font-mono text-xs">
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
                Symptom Ingestion &amp; Deterministic Readiness Update
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
            <strong className="text-[#F0F2F5]">Safety Protocol:</strong> Data yang dilaporkan di sini langsung menentukan batas izin latihan berikutnya. Bila mengalami pembengkakan akut, rasa goyang sendi, atau nyeri hentakan tajam, hentikan sesi latihan dan lakukan evaluasi klinis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Selection with Direct Link */}
          {sortedActivities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <label className="uppercase font-bold text-[#9BA3AF] flex items-center gap-1.5">
                  <ActivityIcon className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>Link to Ingested Activity</span>
                </label>
                {selectedActivity && (
                  <Link
                    href={`/activities/${selectedActivity.id}`}
                    target="_blank"
                    className="text-[#00F0FF] hover:text-[#D4FF00] font-bold flex items-center gap-1 hover:underline transition-colors"
                  >
                    <span>Buka Aktivitas Ini Langsung</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Dropdown with chronologically sorted activities (newest on top) */}
              <select
                value={selectedActivityId}
                onChange={(e) => handleActivitySelect(e.target.value)}
                className="w-full bg-[#090A0F] border border-[#1F2430] rounded-sm px-2.5 py-2 text-[#F0F2F5] focus:outline-none focus:border-[#00F0FF] text-xs font-mono"
              >
                {sortedActivities.map((act, idx) => {
                  const dateStr = formatDate(act.start_date);
                  const isTop = idx === 0;
                  return (
                    <option key={act.id} value={act.id}>
                      {isTop ? "⭐ [TERBARU] " : ""}{dateStr ? `[${dateStr}] ` : ""}{act.name} ({act.sport_type} • {(act.distance_meters / 1000).toFixed(1)} km)
                    </option>
                  );
                })}
              </select>

              {/* Direct Activity Summary Card with Interactive Deep Link */}
              {selectedActivity && (
                <div className="p-2.5 rounded-sm bg-[#161922] border border-[#1F2430] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-xs font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shrink-0">
                        {selectedActivity.sport_type}
                      </span>
                      <span className="font-bold text-xs text-[#F0F2F5] truncate">
                        {selectedActivity.name}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[#9BA3AF] flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#5A6272]" />
                        <span>{formatDate(selectedActivity.start_date)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#5A6272]" />
                        <span>{(selectedActivity.distance_meters / 1000).toFixed(2)} km</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#5A6272]" />
                        <span>{formatDuration(selectedActivity.moving_time_seconds)}</span>
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/activities/${selectedActivity.id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-sm bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 font-bold text-[10.5px] flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-[0.98]"
                  >
                    <span>Detail Aktivitas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
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
                  Saat Sesi Latihan
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
                  <span
                    className={`font-bold font-tabular text-sm w-5 text-right ${
                      painDuring > 0 ? "text-[#FF2A6D]" : "text-[#10B981]"
                    }`}
                  >
                    {painDuring}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9BA3AF] mb-1">
                  Sesaat Pasca Sesi
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
                  <span
                    className={`font-bold font-tabular text-sm w-5 text-right ${
                      painAfter > 0 ? "text-[#FF2A6D]" : "text-[#10B981]"
                    }`}
                  >
                    {painAfter}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#9BA3AF] mb-1">
                  Keesokan Harinya (Pagi)
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
                  <span
                    className={`font-bold font-tabular text-sm w-5 text-right ${
                      painNextDay > 0 ? "text-[#FF2A6D]" : "text-[#10B981]"
                    }`}
                  >
                    {painNextDay}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Biological Circuit Breakers (Swelling & Instability) */}
          <div className="p-3 bg-[#090A0F] border border-[#1F2430] rounded-sm space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-[#F0F2F5] tracking-wider block">
              2. Structural Symptoms &amp; Circuit Breakers
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-2 rounded-sm bg-[#161922] border border-[#1F2430] cursor-pointer hover:border-[#2D3547]">
                <span className="text-[11px] text-[#F0F2F5]">
                  Pembengkakan Sendi Teramati?
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
                  Ketidakstabilan / Sendi Goyang?
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
              <label className="block text-[10px] text-[#9BA3AF] mb-1 font-bold">
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
              <label className="block text-[10px] text-[#9BA3AF] mb-1 font-bold">
                Catatan Subjektif Atlet
              </label>
              <input
                type="text"
                placeholder="Contoh: Engkel stabil saat putaran flat, sedikit kaku lutut saat tangga"
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
              className="px-3 py-1.5 rounded-sm bg-[#161922] border border-[#1F2430] text-[#9BA3AF] hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-sm bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 font-bold hover:bg-[#00F0FF]/25 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? "Mengevaluasi Kesiapan..." : "Simpan Check-in & Perbarui"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
