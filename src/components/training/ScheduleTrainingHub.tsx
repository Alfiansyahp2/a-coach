"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  ClipboardCheck,
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
import { ScheduleTrainingHeader } from "./ScheduleTrainingHeader";

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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedCustomMatch, setSelectedCustomMatch] = useState<WorkoutActivityMatch | null>(null);
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

  const handleSelectWorkout = (w: ScheduledWorkout) => {
    setSelectedWorkout(w);
    setSelectedCustomMatch(null);
    const m = matches.find((match) => match.workout_id === w.id);
    if (m) {
      const act = initialActivities.find((a) => a.id === m.activity_id);
      setSelectedActivity(act || null);
    } else {
      const sameDayAct = initialActivities.find(
        (a) => formatDateOnly(a.start_date) === formatDateOnly(w.scheduled_date)
      );
      setSelectedActivity(sameDayAct || null);
    }
  };

  const handleSelectActivity = (act: Activity) => {
    const actDate = formatDateOnly(act.start_date);
    const existingWorkout = initialWorkouts.find(
      (w) => formatDateOnly(w.scheduled_date) === actDate
    );

    const isRun = (act.sport_type || "").toLowerCase().includes("run");
    const isCycling =
      (act.sport_type || "").toLowerCase().includes("ride") ||
      (act.sport_type || "").toLowerCase().includes("cycl");

    if (existingWorkout) {
      setSelectedWorkout(existingWorkout);
      setSelectedActivity(act);
      const existingMatch = matches.find((m) => m.workout_id === existingWorkout.id);
      setSelectedCustomMatch(
        existingMatch || {
          id: `match-${act.id}`,
          workout_id: existingWorkout.id,
          activity_id: act.id,
          is_manual_match: false,
          completion_percentage: 100,
          distance_delta_meters: 0,
          duration_delta_seconds: 0,
          pace_delta_seconds_per_km: 0,
          matched_at: act.created_at || act.start_date,
        }
      );
    } else {
      const syntheticWorkout: ScheduledWorkout = {
        id: `act-workout-${act.id}`,
        user_id: act.user_id,
        plan_id: initialPlan?.id || "custom-plan",
        scheduled_date: act.start_date,
        workout_category: isRun ? "Easy Run" : isCycling ? "Cycling" : "Cross Training",
        target_distance_meters: act.distance_meters,
        target_duration_seconds: act.moving_time_seconds,
        target_intensity: "Zone 2 • Sesi Tercatat",
        description: act.name
          ? `${act.name} (Tercatat via Strava / Manual)`
          : "Sesi aktivitas tersinkronisasi.",
        status: "COMPLETED",
        created_at: act.created_at || act.start_date,
        updated_at: act.updated_at || act.start_date,
      };

      const syntheticMatch: WorkoutActivityMatch = {
        id: `match-${act.id}`,
        workout_id: syntheticWorkout.id,
        activity_id: act.id,
        is_manual_match: false,
        completion_percentage: 100,
        distance_delta_meters: 0,
        duration_delta_seconds: 0,
        pace_delta_seconds_per_km: 0,
        matched_at: act.created_at || act.start_date,
      };

      setSelectedWorkout(syntheticWorkout);
      setSelectedActivity(act);
      setSelectedCustomMatch(syntheticMatch);
    }
  };

  const isSelectedWorkoutMissed = selectedWorkout
    ? selectedWorkout.status !== "COMPLETED" &&
      (selectedWorkout.status === "MISSED" ||
        (todayStr && formatDateOnly(selectedWorkout.scheduled_date) < todayStr))
    : false;

  return (
    <div className="space-y-6">
      {/* 1. Header Strip: Active 12-Week Plan & Macro Calibration */}
      <ScheduleTrainingHeader
        initialPlan={initialPlan}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />


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
          onSelectWorkout={handleSelectWorkout}
          onSelectActivity={handleSelectActivity}
          isRunningCategory={isRunningCategory}
          todayStr={todayStr}
        />
      ) : (
        <TrainingWorkoutListView
          filteredWorkouts={filteredWorkouts}
          onSelectWorkout={handleSelectWorkout}
          isRunningCategory={isRunningCategory}
          todayStr={todayStr}
        />
      )}

      {/* 6. Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDossierModal
          workout={selectedWorkout}
          match={selectedMatch || selectedCustomMatch}
          activity={selectedActivity}
          isMissed={Boolean(isSelectedWorkoutMissed)}
          onClose={() => {
            setSelectedWorkout(null);
            setSelectedActivity(null);
            setSelectedCustomMatch(null);
          }}
          isRunningCategory={isRunningCategory}
        />
      )}
    </div>
  );
}
