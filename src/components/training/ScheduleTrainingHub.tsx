"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  ScheduledWorkout,
  TrainingPlan,
  FitnessGoal,
  WorkoutActivityMatch,
  AuthoritativeAthleteHealthContext,
} from "@/types";
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Grid,
  List,
} from "lucide-react";
import { AddActivityModal } from "@/components/AddActivityModal";
import { formatDateOnly } from "@/lib/formatters";
import { MacroObjectivesStrip } from "./MacroObjectivesStrip";
import { Zone2PacingGuidelinePanel } from "./Zone2PacingGuidelinePanel";
import { WorkoutDossierModal } from "./WorkoutDossierModal";
import { buildCalendarWeeks } from "./calendarBuilder";
import { TrainingPhaseAndFilterToolbar } from "./filters/TrainingPhaseAndFilterToolbar";
import { TrainingCalendarGridView } from "./views/TrainingCalendarGridView";
import { TrainingWorkoutListView } from "./views/TrainingWorkoutListView";

interface ScheduleTrainingHubProps {
  initialPlan: TrainingPlan | null;
  initialWorkouts: ScheduledWorkout[];
  initialGoals: FitnessGoal[];
  matches: WorkoutActivityMatch[];
  healthContext: AuthoritativeAthleteHealthContext | null;
  initialTodayDate?: string;
  initialActivities?: Activity[];
}

export function ScheduleTrainingHub({
  initialPlan,
  initialWorkouts,
  initialGoals,
  matches,
  initialTodayDate,
  initialActivities = [],
}: ScheduleTrainingHubProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedPhase, setSelectedPhase] = useState<"ALL" | "PHASE_1" | "PHASE_2" | "PHASE_3">("ALL");
  const [filter, setFilter] = useState<"ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED">("ALL");
  const [selectedWorkout, setSelectedWorkout] = useState<ScheduledWorkout | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Dynamic current date resolution (synchronizes with real-world date, e.g. "2026-11-04")
  const [todayStr, setTodayStr] = useState<string>(
    () => initialTodayDate || formatDateOnly(new Date())
  );

  useEffect(() => {
    setTodayStr(formatDateOnly(new Date()));
  }, []);

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

  const allWeeks = buildCalendarWeeks(
    initialWorkouts,
    initialActivities,
    filter,
    todayStr,
    isRunningCategory
  );

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
      <MacroObjectivesStrip goals={initialGoals} plan={initialPlan} />

      {/* 3. Zone 2 Endurance Pacing & Parameter Guide Banner */}
      <Zone2PacingGuidelinePanel />

      {/* 4. Phase Switcher & Sport Type Filter Toolbar */}
      <TrainingPhaseAndFilterToolbar
        selectedPhase={selectedPhase}
        onSelectPhase={setSelectedPhase}
        displayedWeeksCount={displayedWeeks.length}
        filter={filter}
        onSelectFilter={setFilter}
        totalWorkoutsCount={initialWorkouts.length}
        cyclingCount={cyclingCount}
        runningCount={runningCount}
        rehabCount={rehabCount}
        completedCount={completedCount}
        filteredCount={filteredWorkouts.length}
      />

      {/* 5. Active View Rendering: Calendar Grid vs Linear List */}
      {viewMode === "calendar" ? (
        <TrainingCalendarGridView
          displayedWeeks={displayedWeeks}
          onSelectWorkout={setSelectedWorkout}
          isRunningCategory={isRunningCategory}
          todayStr={todayStr}
        />
      ) : (
        <TrainingWorkoutListView
          filteredWorkouts={filteredWorkouts}
          onSelectWorkout={setSelectedWorkout}
          isRunningCategory={isRunningCategory}
        />
      )}

      {/* 6. Workout Detail Modal */}
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
