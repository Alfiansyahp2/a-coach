"use client";

import React, { useState } from "react";
import {
  Activity,
  ScheduledWorkout,
  TrainingPlan,
  FitnessGoal,
  AuthoritativeAthleteHealthContext,
  PersonalRecord,
} from "@/types";
import { CoachHeaderStrip } from "./CoachHeaderStrip";
import { RunningCoachView } from "./RunningCoachView";
import { CyclingCoachView } from "./CyclingCoachView";

interface CoachHubProps {
  initialMode?: "running" | "cycling";
  activities: Activity[];
  workouts: ScheduledWorkout[];
  goals: FitnessGoal[];
  activePlan: TrainingPlan | null;
  healthContext: AuthoritativeAthleteHealthContext | null;
  prs: PersonalRecord[];
}

export function CoachHub({
  initialMode = "cycling",
  activities,
  workouts,
  goals,
  activePlan,
  healthContext,
  prs,
}: CoachHubProps) {
  const [currentMode, setCurrentMode] = useState<"running" | "cycling">(initialMode);

  return (
    <div className="space-y-6">
      {/* 1. Header Strip with Prominent Running & Cycling Coach Selector Tabs */}
      <CoachHeaderStrip
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
      />

      {/* 2. Specialized Coach View */}
      {currentMode === "running" ? (
        <RunningCoachView
          activities={activities}
          workouts={workouts}
          goals={goals}
          healthContext={healthContext}
          prs={prs}
          onSwitchToCycling={() => setCurrentMode("cycling")}
        />
      ) : (
        <CyclingCoachView
          activities={activities}
          workouts={workouts}
          goals={goals}
          activePlan={activePlan}
          healthContext={healthContext}
          prs={prs}
          onSwitchToRunning={() => setCurrentMode("running")}
        />
      )}
    </div>
  );
}

