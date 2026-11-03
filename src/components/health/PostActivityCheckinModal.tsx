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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl relative font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)]">
              <ActivityIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-[var(--color-text-primary)]">
                Check-In Pasca Latihan
              </h3>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                Evaluasi Respon Subjektif &amp; Penyesuaian Kesiapan
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clinical Safety Alert Banner */}
        <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-alert-amber)]/30 flex items-start gap-2.5 text-[11px] font-mono text-[var(--color-text-secondary)]">
          <ShieldAlert className="w-4 h-4 text-[var(--color-alert-amber)] shrink-0 mt-0.5" />
          <p>
            <strong className="text-[var(--color-text-primary)]">Protokol Keselamatan:</strong> Data yang dilaporkan di sini langsung menentukan batas beban latihan sesi berikutnya. Hentikan latihan dan evaluasi bila timbul efusi atau nyeri akut.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Selection with Direct Link */}
          {sortedActivities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <label className="uppercase font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                  <span>Pilih Aktivitas Terkait</span>
                </label>
                {selectedActivity && (
                  <Link
                    href={`/activities/${selectedActivity.id}`}
                    target="_blank"
                    className="text-[var(--color-cycling)] hover:underline font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Buka Aktivitas Langsung</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Dropdown with chronologically sorted activities */}
              <select
                value={selectedActivityId}
                onChange={(e) => handleActivitySelect(e.target.value)}
                className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)] text-xs font-mono"
              >
                {sortedActivities.map((act, idx) => {
                  const dateStr = formatDate(act.start_date);
                  const isTop = idx === 0;
                  return (
                    <option key={act.id} value={act.id}>
                      {isTop ? "★ [TERBARU] " : ""}{dateStr ? `[${dateStr}] ` : ""}{act.name} ({act.sport_type} • {(act.distance_meters / 1000).toFixed(1)} km)
                    </option>
                  );
                })}
              </select>

              {/* Direct Activity Summary Card */}
              {selectedActivity && (
                <div className="p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                        selectedActivity.sport_type === "Ride"
                          ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                          : "bg-[var(--color-running)]/15 text-[var(--color-running)] border-[var(--color-running)]/30"
                      }`}>
                        {selectedActivity.sport_type}
                      </span>
                      <span className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                        {selectedActivity.name}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[var(--color-text-secondary)] flex flex-wrap items-center gap-x-3 gap-y-1 font-tabular">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--color-text-muted)]" />
                        <span>{formatDate(selectedActivity.start_date)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
                        <span>{(selectedActivity.distance_meters / 1000).toFixed(2)} km</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
                        <span>{formatDuration(selectedActivity.moving_time_seconds)}</span>
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/activities/${selectedActivity.id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-md bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold text-[10.5px] flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs"
                  >
                    <span>Detail Aktivitas</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Pain Telemetry Grid */}
          <div className="p-3.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg space-y-3">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-primary)] tracking-wider block">
              1. Skala Nyeri Sendi (0 = Tidak Ada, 10 = Nyeri Berat)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                  Saat Sesi Latihan
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painDuring}
                    onChange={(e) => setPainDuring(Number(e.target.value))}
                    className="w-full accent-[var(--color-cycling)]"
                  />
                  <span
                    className={`font-bold font-tabular text-sm w-5 text-right ${
                      painDuring > 0 ? "text-[var(--color-alert-red)]" : "text-[var(--color-cycling)]"
                    }`}
                  >
                    {painDuring}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                  Sesaat Pasca Sesi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painAfter}
                    onChange={(e) => setPainAfter(Number(e.target.value))}
                    className="w-full accent-[var(--color-cycling)]"
                  />
                  <span
                    className={`font-bold font-tabular text-sm w-5 text-right ${
                      painAfter > 0 ? "text-[var(--color-alert-red)]" : "text-[var(--color-cycling)]"
                    }`}
                  >
                    {painAfter}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                  Keesokan Harinya
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painNextDay}
                    onChange={(e) => setPainNextDay(Number(e.target.value))}
                    className="w-full accent-[var(--color-cycling)]"
                  />
                  <span
                    className={`font-bold font-tabular text-sm w-5 text-right ${
                      painNextDay > 0 ? "text-[var(--color-alert-red)]" : "text-[var(--color-cycling)]"
                    }`}
                  >
                    {painNextDay}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Biological Circuit Breakers (Swelling & Instability) */}
          <div className="p-3.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-lg space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-primary)] tracking-wider block">
              2. Indikator Biologis &amp; Pembatasan Keamanan
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] cursor-pointer">
                <span className="text-[11px] text-[var(--color-text-primary)]">
                  Pembengkakan Sendi Teramati?
                </span>
                <input
                  type="checkbox"
                  checked={swelling}
                  onChange={(e) => setSwelling(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-alert-red)]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-md bg-[var(--color-surface-card)] border border-[var(--color-border)] cursor-pointer">
                <span className="text-[11px] text-[var(--color-text-primary)]">
                  Ketidakstabilan / Sendi Goyang?
                </span>
                <input
                  type="checkbox"
                  checked={instability}
                  onChange={(e) => setInstability(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-alert-red)]"
                />
              </label>
            </div>
          </div>

          {/* RPE & Subjective Comments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                Perceived Exertion (RPE 1-10)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[var(--color-cycling)] font-bold font-tabular focus:outline-none focus:border-[var(--color-cycling)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                Catatan Subjektif Atlet
              </label>
              <input
                type="text"
                placeholder="Contoh: Engkel stabil saat putaran flat, sedikit kaku lutut saat tangga"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cycling)]"
              />
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-md border text-[11px] flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                  : "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/30"
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
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-md bg-[var(--color-cycling)] text-white font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Menyimpan Check-in..." : "Simpan Check-in"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
