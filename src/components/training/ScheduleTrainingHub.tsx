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
import { formatDateOnly } from "@/lib/formatters";
import { MacroObjectivesStrip } from "./MacroObjectivesStrip";
import { Zone2PacingGuidelinePanel } from "./Zone2PacingGuidelinePanel";
import { WorkoutDossierModal } from "./WorkoutDossierModal";
import { buildCalendarWeeks } from "./calendarBuilder";
import { CalendarCommandBar } from "./navigation/CalendarCommandBar";
import { TrainingMonthGridView } from "./views/TrainingMonthGridView";
import { TrainingWeekAgendaView } from "./views/TrainingWeekAgendaView";
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
  healthContext,
  initialTodayDate,
  initialActivities = [],
}: ScheduleTrainingHubProps) {
  // Primary view mode: "month" (Default true month grid), "week" (Spacious agenda), or "list"
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [filter, setFilter] = useState<"ALL" | "RUNNING" | "CYCLING" | "REHAB" | "COMPLETED">("ALL");
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  const [selectedWorkout, setSelectedWorkout] = useState<ScheduledWorkout | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedCustomMatch, setSelectedCustomMatch] = useState<WorkoutActivityMatch | null>(null);

  const [todayStr, setTodayStr] = useState<string>(
    () => initialTodayDate || formatDateOnly(new Date())
  );

  useEffect(() => {
    setTodayStr(formatDateOnly(new Date()));
  }, []);

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

  const runningCount = initialWorkouts.filter((w) => isRunningCategory(w.workout_category)).length;
  const cyclingCount = initialWorkouts.filter((w) => w.workout_category === "Cycling").length;

  const allWeeks = buildCalendarWeeks(
    initialWorkouts,
    initialActivities,
    filter,
    todayStr,
    isRunningCategory
  );

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
        description: act.name ? `${act.name} (Tercatat via Strava / Manual)` : "Sesi aktivitas tersinkronisasi.",
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
    <div className="space-y-4 font-mono">
      {/* 1. Sleek Unified Command Bar (Replaces 5 bulky stacked panels) */}
      <CalendarCommandBar
        initialPlan={initialPlan}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filter={filter}
        onSelectFilter={setFilter}
        healthContext={healthContext}
        isGuidelinesOpen={isGuidelinesOpen}
        onToggleGuidelines={() => setIsGuidelinesOpen(!isGuidelinesOpen)}
        cyclingCount={cyclingCount}
        runningCount={runningCount}
      />

      {/* 2. Collapsible Macro Objectives & Zone 2 Guidelines Drawer */}
      {isGuidelinesOpen && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <MacroObjectivesStrip goals={initialGoals} plan={initialPlan} />
          <Zone2PacingGuidelinePanel />
        </div>
      )}

      {/* 3. The Hero: Active Calendar View */}
      {viewMode === "month" ? (
        <TrainingMonthGridView
          initialWorkouts={initialWorkouts}
          activities={initialActivities}
          filter={filter}
          todayStr={todayStr}
          isRunningCategory={isRunningCategory}
          onSelectWorkout={handleSelectWorkout}
          onSelectActivity={handleSelectActivity}
        />
      ) : viewMode === "week" ? (
        <TrainingWeekAgendaView
          weeks={allWeeks}
          todayStr={todayStr}
          onSelectWorkout={handleSelectWorkout}
          onSelectActivity={handleSelectActivity}
          isRunningCategory={isRunningCategory}
          healthContext={healthContext}
        />
      ) : (
        <TrainingWorkoutListView
          filteredWorkouts={filteredWorkouts}
          onSelectWorkout={handleSelectWorkout}
          isRunningCategory={isRunningCategory}
          todayStr={todayStr}
        />
      )}

      {/* 4. Workout Dossier Modal */}
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
