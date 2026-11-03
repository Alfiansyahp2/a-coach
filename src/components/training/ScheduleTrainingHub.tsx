"use client";

import React, { useState } from "react";
import {
  ScheduledWorkout,
  TrainingPlan,
  FitnessGoal,
  WorkoutActivityMatch,
  AuthoritativeAthleteHealthContext,
} from "@/types";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Bike,
  Zap,
  RefreshCw,
  Grid,
  List,
  Footprints,
  Sliders,
} from "lucide-react";
import { formatDistance, formatDuration, formatDate } from "@/lib/formatters";
import { AddActivityModal } from "@/components/AddActivityModal";
import { MacroObjectivesStrip } from "./MacroObjectivesStrip";
import { Zone2PacingGuidelinePanel } from "./Zone2PacingGuidelinePanel";
import { CalendarDayCard } from "./CalendarDayCard";
import { WorkoutDossierModal } from "./WorkoutDossierModal";
import { buildCalendarWeeks } from "./calendarBuilder";

interface ScheduleTrainingHubProps {
  initialPlan: TrainingPlan | null;
  initialWorkouts: ScheduledWorkout[];
  initialGoals: FitnessGoal[];
  matches: WorkoutActivityMatch[];
  healthContext: AuthoritativeAthleteHealthContext | null;
}

export function ScheduleTrainingHub({
  initialPlan,
  initialWorkouts,
  matches,
}: ScheduleTrainingHubProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedPhase, setSelectedPhase] = useState<"ALL" | "PHASE_1" | "PHASE_2" | "PHASE_3">("ALL");
  const [filter, setFilter] = useState<"ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED">("ALL");
  const [selectedWorkout, setSelectedWorkout] = useState<ScheduledWorkout | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const todayStr = "2026-11-02"; // Reference current date

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/training/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal sinkronisasi rencana latihan");
      }
      setMessage("Program 12-Minggu Zone 2 berhasil dikalibrasi ulang dari database!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const isRunningCategory = (cat: string) =>
    cat.toLowerCase().includes("run") || cat.toLowerCase().includes("lari");

  const filteredWorkouts = initialWorkouts.filter((w) => {
    if (filter === "RUNNING") return isRunningCategory(w.workout_category);
    if (filter === "CYCLING") return w.workout_category === "Cycling";
    if (filter === "REHAB")
      return w.workout_category === "Cross Training" || w.workout_category === "Strength Training";
    if (filter === "COMPLETED") return w.status === "COMPLETED";
    return true;
  });

  const completedCount = initialWorkouts.filter((w) => w.status === "COMPLETED").length;
  const runningCount = initialWorkouts.filter((w) => isRunningCategory(w.workout_category)).length;
  const cyclingCount = initialWorkouts.filter((w) => w.workout_category === "Cycling").length;
  const rehabCount = initialWorkouts.filter(
    (w) => w.workout_category === "Cross Training" || w.workout_category === "Strength Training"
  ).length;

  const allWeeks = buildCalendarWeeks(initialWorkouts, filter, todayStr, isRunningCategory);

  // Filter weeks by phase
  const displayedWeeks = allWeeks.filter((w) => {
    if (selectedPhase === "PHASE_1") return w.phaseNumber === 1;
    if (selectedPhase === "PHASE_2") return w.phaseNumber === 2;
    if (selectedPhase === "PHASE_3") return w.phaseNumber === 3;
    return true;
  });

  const selectedMatch = selectedWorkout
    ? matches.find((m) => m.workout_id === selectedWorkout.id)
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Header Strip: Active 12-Week Plan & Macro Calibration */}
      <div className="p-5 sm:p-6 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-cycling)] shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-primary)]">
                  {initialPlan?.title || "Program Periodisasi 12-Minggu Zone 2 Endurance"}
                </h1>
                <span className="text-[9.5px] px-2.5 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold uppercase tracking-wider">
                  Active Macrocycle
                </span>
              </div>
              <span className="text-[11px] text-[var(--color-text-secondary)] block">
                Roadmap 3 Bulan • MTB Zone 2 (RPE 3–4) • 3 Sesi/Minggu • Puasa Senin &amp; Kamis Terproteksi
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Calendar Grid vs List */}
          <div className="flex items-center p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === "calendar"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              <span>Kalender Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] font-bold shadow-xs border border-[var(--color-border)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <List className="w-3.5 h-3.5 text-[var(--color-running)]" />
              <span>Daftar Sesi</span>
            </button>
          </div>

          <AddActivityModal variant="button" />

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-4 py-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-cycling)] text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[var(--color-cycling)] ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Mengalibrasi..." : "Sinkronisasi"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 text-xs font-mono text-[var(--color-cycling)] font-semibold">
          {message}
        </div>
      )}

      {/* 2. Macro Objectives Progress Bar Strip */}
      <MacroObjectivesStrip />

      {/* 3. Zone 2 Endurance Pacing & Parameter Guide Banner */}
      <Zone2PacingGuidelinePanel />

      {/* 4. Phase Switcher (12-Week Periodization Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] font-mono text-xs shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] px-2 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[var(--color-text-muted)]" />
            FASE:
          </span>
          <button
            onClick={() => setSelectedPhase("ALL")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "ALL"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua (12 Minggu)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_1")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "PHASE_1"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            Fase 1: Fondasi Awal (M1–4)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_2")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "PHASE_2"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            Fase 2: Endurance Base (M5–8)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_3")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              selectedPhase === "PHASE_3"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-cycling)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            Fase 3: Spesifisitas Zone 2 (M9–12)
          </button>
        </div>

        <div className="text-[10px] text-[var(--color-text-muted)] pr-2 font-tabular">
          <span>Menampilkan: <strong className="text-[var(--color-text-primary)]">{displayedWeeks.length} Minggu Siklus</strong></span>
        </div>
      </div>

      {/* 5. Sport Type Filter Segment Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] font-mono text-xs shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold ${
              filter === "ALL"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Semua Sesi ({initialWorkouts.length})
          </button>
          <button
            onClick={() => setFilter("CYCLING")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "CYCLING"
                ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Sepeda MTB ({cyclingCount})</span>
          </button>
          <button
            onClick={() => setFilter("RUNNING")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "RUNNING"
                ? "bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-running)]"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Lari Bertahap ({runningCount})</span>
          </button>
          <button
            onClick={() => setFilter("REHAB")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "REHAB"
                ? "bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-alert-amber)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Rehab &amp; Tubuh Atas ({rehabCount})</span>
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-3.5 py-1.5 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
              filter === "COMPLETED"
                ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold shadow-xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-cycling)]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terverifikasi Strava ({completedCount})</span>
          </button>
        </div>

        <div className="text-[10px] text-[var(--color-text-muted)] pr-2 font-tabular">
          <span>Menampilkan: <strong className="text-[var(--color-text-primary)]">{filteredWorkouts.length} Sesi Terdaftar</strong></span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. CALENDAR MATRIX VIEW (PREMIUM ATHLETIC PERIODIZATION GRID)        */}
      {/* ===================================================================== */}
      {viewMode === "calendar" ? (
        <div className="space-y-6 font-mono">
          {/* Day Names Header Row (Mon - Sun) */}
          <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--color-text-muted)] pb-1 border-b border-[var(--color-border)]">
            <div className="text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <span>SENIN</span>
              <span className="text-[8.5px] font-normal">(PUASA)</span>
            </div>
            <div className="text-[var(--color-cycling)] flex items-center justify-center gap-1">
              <span>SELASA</span>
              <span className="text-[8.5px] font-normal">(EASY MTB)</span>
            </div>
            <div className="text-[var(--color-alert-amber)] flex items-center justify-center gap-1">
              <span>RABU</span>
              <span className="text-[8.5px] font-normal">(OPSI/REHAB)</span>
            </div>
            <div className="text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <span>KAMIS</span>
              <span className="text-[8.5px] font-normal">(PUASA)</span>
            </div>
            <div className="text-[var(--color-cycling)] flex items-center justify-center gap-1">
              <span>JUMAT</span>
              <span className="text-[8.5px] font-normal">(RECOVERY)</span>
            </div>
            <div className="text-[var(--color-text-secondary)] flex items-center justify-center gap-1">
              <span>SABTU</span>
              <span className="text-[8.5px] font-normal">(BUFFER)</span>
            </div>
            <div className="text-[var(--color-cycling)] flex items-center justify-center gap-1">
              <span>MINGGU</span>
              <span className="text-[8.5px] font-normal">(LONG MTB)</span>
            </div>
          </div>

          {/* Weeks Loop */}
          {displayedWeeks.map((week) => (
            <div
              key={week.weekNumber}
              className={`p-4 rounded-xl bg-[var(--color-surface-card)] border space-y-3 shadow-xs transition-all ${
                week.isDeload
                  ? "border-purple-500/40 bg-purple-500/[0.03]"
                  : "border-[var(--color-border)]"
              }`}
            >
              {/* Week Row Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        week.isDeload ? "bg-purple-500" : "bg-[var(--color-cycling)]"
                      }`}
                    />
                    <span className="text-xs font-bold uppercase text-[var(--color-text-primary)]">
                      {week.weekLabel}
                    </span>
                    <span className="text-[10px] text-[var(--color-cycling)] px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/10 border border-[var(--color-cycling)]/30 font-semibold">
                      {week.focusTitle}
                    </span>
                    {week.isDeload && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                        DELOAD WEEK
                      </span>
                    )}
                    {week.totalDistanceMeters >= week.minDistanceMeters ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30">
                        ✓ TARGET TERCAPAI ({week.targetAchievedPct}%)
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30">
                        PROGRES ({week.targetAchievedPct}%)
                      </span>
                    )}
                  </div>

                  {/* Weekly Mileage Target vs Scheduled Breakdown */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-[var(--color-text-secondary)] font-tabular">
                    <span>
                      Target Minimal: <strong className="text-[var(--color-text-primary)] font-bold">{week.minTargetKm} km</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total Terjadwal: <strong className="text-[var(--color-text-primary)] font-bold">{(week.totalDistanceMeters / 1000).toFixed(1)} km</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[var(--color-text-muted)]">
                      (Sepeda MTB: <strong className="text-[var(--color-cycling)]">{(week.cyclingDistanceMeters / 1000).toFixed(1)} km</strong>
                      {week.runningDistanceMeters > 0 && (
                        <> • Lari: <strong className="text-[var(--color-running)]">{(week.runningDistanceMeters / 1000).toFixed(1)} km</strong></>
                      )})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {/* Mini Progress Bar for Weekly Target Mileage */}
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-between gap-3 text-[9.5px] text-[var(--color-text-muted)] font-tabular">
                      <span>Progres Jarak:</span>
                      <span className="font-bold text-[var(--color-text-primary)]">{(week.totalDistanceMeters / 1000).toFixed(1)} / {week.minTargetKm} km</span>
                    </div>
                    <div className="w-32 h-2 bg-[var(--color-surface-muted)] rounded-full border border-[var(--color-border)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          week.isDeload
                            ? "bg-purple-500"
                            : week.targetAchievedPct >= 100
                            ? "bg-[var(--color-cycling)]"
                            : "bg-[var(--color-endurance)]"
                        }`}
                        style={{ width: `${Math.min(100, week.targetAchievedPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-[var(--color-text-muted)] pl-2 border-l border-[var(--color-border)] font-tabular">
                    <span>Durasi: <strong className="text-[var(--color-text-primary)]">{formatDuration(week.totalDurationSeconds)}</strong></span>
                  </div>
                </div>
              </div>

              {/* 7 Days Grid for this week */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
                {week.days.map((day) => (
                  <CalendarDayCard
                    key={day.dateStr}
                    day={day}
                    minTargetKm={week.minTargetKm}
                    onSelectWorkout={setSelectedWorkout}
                    isRunningCategory={isRunningCategory}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ===================================================================== */
        /* 7. LINEAR LIST VIEW (FOR DETAILED PRESCRIPTION INSPECTION)            */
        /* ===================================================================== */
        <div className="space-y-3 font-mono">
          {filteredWorkouts.map((wo) => {
            const isRun = isRunningCategory(wo.workout_category);
            const isCycling = wo.workout_category === "Cycling";
            const isCross = wo.workout_category === "Cross Training" || wo.workout_category === "Strength Training";
            const isCompleted = wo.status === "COMPLETED";

            return (
              <div
                key={wo.id}
                onClick={() => setSelectedWorkout(wo)}
                className={`p-4 rounded-xl bg-[var(--color-surface-card)] border cursor-pointer transition-all ${
                  isCompleted
                    ? "border-[var(--color-cycling)]/40 hover:border-[var(--color-cycling)]"
                    : isRun
                    ? "border-[var(--color-running)]/40 hover:border-[var(--color-running)]"
                    : isCycling
                    ? "border-[var(--color-cycling)]/30 hover:border-[var(--color-cycling)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isRun
                          ? "bg-[var(--color-running)]/10 text-[var(--color-running)] border-[var(--color-running)]/30"
                          : isCycling
                          ? "bg-[var(--color-cycling)]/10 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                          : isCross
                          ? "bg-[var(--color-alert-amber)]/10 text-[var(--color-alert-amber)] border-[var(--color-alert-amber)]/30"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                      }`}
                    >
                      {wo.workout_category}
                    </span>

                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {formatDate(wo.scheduled_date)}
                    </span>

                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      • {wo.target_intensity || "Zone 2 • RPE 3–4"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border-[var(--color-cycling)]/30"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                      }`}
                    >
                      {isCompleted ? "VERIFIED COMPLETED" : "PLANNED"}
                    </span>

                    <div className="text-right">
                      <span className="text-sm font-bold font-tabular text-[var(--color-text-primary)]">
                        {wo.target_duration_seconds
                          ? formatDuration(wo.target_duration_seconds)
                          : wo.target_distance_meters
                          ? formatDistance(wo.target_distance_meters)
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 text-xs text-[var(--color-text-secondary)] space-y-1">
                  <p className="leading-relaxed">{wo.description}</p>
                  {wo.target_duration_seconds && wo.target_distance_meters && (
                    <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] pt-1 font-tabular">
                      <span>Target Durasi: <strong className="text-[var(--color-text-primary)]">{formatDuration(wo.target_duration_seconds)}</strong></span>
                      <span>Target Jarak Estimasi: <strong className="text-[var(--color-text-primary)]">{formatDistance(wo.target_distance_meters)}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. WORKOUT DETAIL MODAL (PRECISION PRESCRIPTION DOSSIER)               */}
      {/* ===================================================================== */}
      {selectedWorkout && (
        <WorkoutDossierModal
          workout={selectedWorkout}
          match={selectedMatch || null}
          onClose={() => setSelectedWorkout(null)}
          isRunningCategory={isRunningCategory}
        />
      )}
    </div>
  );
}
