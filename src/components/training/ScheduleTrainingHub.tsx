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
      <div className="p-4 rounded-sm bg-[#12151D] border border-[#1F2430] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#161922] border border-[#2D3547] flex items-center justify-center text-[#D4FF00]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm uppercase tracking-wider font-bold text-[#F0F2F5]">
                  {initialPlan?.title || "Program Periodisasi 12-Minggu Zone 2 Endurance"}
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-sm bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                  ACTIVE 12-WEEK MACROCYCLE
                </span>
              </div>
              <span className="text-[11px] text-[#5A6272] block">
                Roadmap 3 Bulan • MTB Zone 2 (RPE 3–4) • 3 Sesi/Minggu • Puasa Senin & Kamis Terproteksi
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Calendar Grid vs List */}
          <div className="flex items-center p-0.5 rounded-sm bg-[#161922] border border-[#1F2430] text-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 transition-all ${
                viewMode === "calendar"
                  ? "bg-[#1C212E] text-[#D4FF00] font-bold shadow-sm"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Kalender Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-[#1C212E] text-[#00F0FF] font-bold shadow-sm"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Sesi</span>
            </button>
          </div>

          <AddActivityModal variant="button" />

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-3 py-1.5 rounded-sm bg-[#D4FF00]/15 border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00]/25 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "MENGALIBRASI..." : "SINKRONISASI ULANG"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-sm bg-[#161922] border border-[#D4FF00]/40 text-xs font-mono text-[#D4FF00]">
          {message}
        </div>
      )}

      {/* 2. Macro Objectives Progress Bar Strip */}
      <MacroObjectivesStrip />

      {/* 3. Zone 2 Endurance Pacing & Parameter Guide Banner */}
      <Zone2PacingGuidelinePanel />

      {/* 4. Phase Switcher (12-Week Periodization Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-sm bg-[#12151D] border border-[#1F2430] font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-[#5A6272] px-2 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#5A6272]" />
            FASE:
          </span>
          <button
            onClick={() => setSelectedPhase("ALL")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "ALL"
                ? "bg-[#1C212E] text-white border border-[#2D3547]"
                : "text-[#9BA3AF] hover:text-white"
            }`}
          >
            Semua (12 Minggu)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_1")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "PHASE_1"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                : "text-[#9BA3AF] hover:text-[#00F0FF]"
            }`}
          >
            Fase 1: Fondasi Awal (M1–4)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_2")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "PHASE_2"
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30"
                : "text-[#9BA3AF] hover:text-[#D4FF00]"
            }`}
          >
            Fase 2: Endurance Base (M5–8)
          </button>
          <button
            onClick={() => setSelectedPhase("PHASE_3")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              selectedPhase === "PHASE_3"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "text-[#9BA3AF] hover:text-[#10B981]"
            }`}
          >
            Fase 3: Spesifisitas Zone 2 (M9–12)
          </button>
        </div>

        <div className="text-[10px] text-[#5A6272] pr-2">
          <span>Menampilkan: <strong>{displayedWeeks.length} Minggu Siklus</strong></span>
        </div>
      </div>

      {/* 5. Sport Type Filter Segment Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-sm bg-[#12151D] border border-[#1F2430] font-mono text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold ${
              filter === "ALL"
                ? "bg-[#1C212E] text-white border border-[#2D3547]"
                : "text-[#9BA3AF] hover:text-white"
            }`}
          >
            Semua Sesi ({initialWorkouts.length})
          </button>
          <button
            onClick={() => setFilter("CYCLING")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "CYCLING"
                ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                : "text-[#9BA3AF] hover:text-[#00F0FF]"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Sepeda MTB ({cyclingCount})</span>
          </button>
          <button
            onClick={() => setFilter("RUNNING")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "RUNNING"
                ? "bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30"
                : "text-[#9BA3AF] hover:text-[#D4FF00]"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Lari Bertahap ({runningCount})</span>
          </button>
          <button
            onClick={() => setFilter("REHAB")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "REHAB"
                ? "bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30"
                : "text-[#9BA3AF] hover:text-[#FF9500]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Rehab & Tubuh Atas ({rehabCount})</span>
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-sm transition-all font-semibold flex items-center gap-1.5 ${
              filter === "COMPLETED"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "text-[#9BA3AF] hover:text-[#10B981]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terverifikasi Strava ({completedCount})</span>
          </button>
        </div>

        <div className="text-[10px] text-[#5A6272] pr-2">
          <span>Menampilkan: <strong>{filteredWorkouts.length} Sesi Terdaftar</strong></span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. CALENDAR MATRIX VIEW (PREMIUM ATHLETIC PERIODIZATION GRID)        */}
      {/* ===================================================================== */}
      {viewMode === "calendar" ? (
        <div className="space-y-6 font-mono">
          {/* Day Names Header Row (Mon - Sun) */}
          <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#9BA3AF] pb-1 border-b border-[#1F2430]">
            <div className="text-[#C084FC] flex items-center justify-center gap-1">
              <span>🌙 SENIN</span>
              <span className="text-[8.5px] font-normal text-[#A855F7]">(PUASA)</span>
            </div>
            <div className="text-[#00F0FF] flex items-center justify-center gap-1">
              <span>SELASA</span>
              <span className="text-[8.5px] font-normal text-[#00F0FF]/80">(EASY MTB)</span>
            </div>
            <div className="text-[#FF9500] flex items-center justify-center gap-1">
              <span>RABU</span>
              <span className="text-[8.5px] font-normal text-[#FF9500]/80">(OPSI/REHAB)</span>
            </div>
            <div className="text-[#C084FC] flex items-center justify-center gap-1">
              <span>🌙 KAMIS</span>
              <span className="text-[8.5px] font-normal text-[#A855F7]">(PUASA)</span>
            </div>
            <div className="text-[#D4FF00] flex items-center justify-center gap-1">
              <span>JUMAT</span>
              <span className="text-[8.5px] font-normal text-[#D4FF00]/80">(RECOVERY)</span>
            </div>
            <div className="text-[#9BA3AF] flex items-center justify-center gap-1">
              <span>SABTU</span>
              <span className="text-[8.5px] font-normal text-[#D4FF00]/70">(BUFFER)</span>
            </div>
            <div className="text-[#00F0FF] flex items-center justify-center gap-1">
              <span>MINGGU</span>
              <span className="text-[8.5px] font-normal text-[#00F0FF]/80">(LONG MTB)</span>
            </div>
          </div>

          {/* Weeks Loop */}
          {displayedWeeks.map((week) => (
            <div
              key={week.weekNumber}
              className={`p-3.5 rounded-sm bg-[#12151D] border space-y-3 shadow-sm transition-all ${
                week.isDeload
                  ? "border-[#A855F7]/40 bg-[#141221]"
                  : "border-[#1F2430]"
              }`}
            >
              {/* Week Row Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#1F2430]/70">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-none ${
                        week.isDeload ? "bg-[#A855F7]" : "bg-[#D4FF00]"
                      }`}
                    />
                    <span className="text-xs font-bold uppercase text-[#F0F2F5]">
                      {week.weekLabel}
                    </span>
                    <span className="text-[10px] text-[#00F0FF] px-1.5 py-0.2 rounded-sm bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                      {week.focusTitle}
                    </span>
                    {week.isDeload && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/40">
                        DELOAD WEEK (SUPERKOMPENSASI)
                      </span>
                    )}
                    {week.totalDistanceMeters >= week.minDistanceMeters ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        ✓ TARGET TERCAPAI ({week.targetAchievedPct}%)
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30">
                        TARGET PROGRES ({week.targetAchievedPct}%)
                      </span>
                    )}
                  </div>

                  {/* Weekly Mileage Target vs Scheduled Breakdown */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-[#9BA3AF]">
                    <span>
                      Target Minimal: <strong className="text-white font-bold">{week.minTargetKm} km</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total Terjadwal: <strong className="text-[#D4FF00] font-bold">{(week.totalDistanceMeters / 1000).toFixed(1)} km</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[#5A6272]">
                      (Sepeda MTB: <strong className="text-[#00F0FF]">{(week.cyclingDistanceMeters / 1000).toFixed(1)} km</strong>
                      {week.runningDistanceMeters > 0 && (
                        <> • Lari: <strong className="text-[#D4FF00]">{(week.runningDistanceMeters / 1000).toFixed(1)} km</strong></>
                      )})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {/* Mini Progress Bar for Weekly Target Mileage */}
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-between gap-3 text-[9.5px] text-[#5A6272]">
                      <span>Progres Jarak:</span>
                      <span className="font-bold text-white">{(week.totalDistanceMeters / 1000).toFixed(1)} / {week.minTargetKm} km</span>
                    </div>
                    <div className="w-32 h-1.5 bg-[#090A0F] border border-[#1F2430] overflow-hidden">
                      <div
                        className={`h-full ${
                          week.isDeload
                            ? "bg-[#A855F7]"
                            : week.targetAchievedPct >= 100
                            ? "bg-[#D4FF00]"
                            : "bg-[#00F0FF]"
                        }`}
                        style={{ width: `${Math.min(100, week.targetAchievedPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-[#5A6272] pl-2 border-l border-[#1F2430]">
                    <span>Durasi: <strong className="text-[#F0F2F5]">{formatDuration(week.totalDurationSeconds)}</strong></span>
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
                className={`p-4 rounded-sm bg-[#12151D] border cursor-pointer transition-all ${
                  isCompleted
                    ? "border-[#10B981]/40 hover:border-[#10B981]"
                    : isRun
                    ? "border-[#D4FF00]/40 hover:border-[#D4FF00]"
                    : isCycling
                    ? "border-[#00F0FF]/30 hover:border-[#00F0FF]"
                    : "border-[#1F2430] hover:border-[#2D3547]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1F2430]/60">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                        isRun
                          ? "bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30"
                          : isCycling
                          ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30"
                          : isCross
                          ? "bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/30"
                          : "bg-[#161922] text-[#9BA3AF] border-[#1F2430]"
                      }`}
                    >
                      {wo.workout_category}
                    </span>

                    <span className="text-xs font-bold text-[#F0F2F5]">
                      {formatDate(wo.scheduled_date)}
                    </span>

                    <span className="text-[10px] text-[#5A6272]">
                      • {wo.target_intensity || "Zone 2 • RPE 3–4"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                        isCompleted
                          ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                          : "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30"
                      }`}
                    >
                      {isCompleted ? "VERIFIED COMPLETED" : "PLANNED"}
                    </span>

                    <div className="text-right">
                      <span className="text-sm font-bold font-tabular text-[#F0F2F5]">
                        {wo.target_duration_seconds
                          ? formatDuration(wo.target_duration_seconds)
                          : wo.target_distance_meters
                          ? formatDistance(wo.target_distance_meters)
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 text-xs text-[#9BA3AF] space-y-1">
                  <p className="leading-relaxed">{wo.description}</p>
                  {wo.target_duration_seconds && wo.target_distance_meters && (
                    <div className="flex items-center gap-4 text-[10px] text-[#5A6272] pt-1">
                      <span>Target Durasi: <strong>{formatDuration(wo.target_duration_seconds)}</strong></span>
                      <span>Target Jarak Estimasi: <strong>{formatDistance(wo.target_distance_meters)}</strong></span>
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
