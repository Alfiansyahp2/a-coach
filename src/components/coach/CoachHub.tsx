"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  ScheduledWorkout,
  TrainingPlan,
  FitnessGoal,
  AuthoritativeAthleteHealthContext,
  PersonalRecord,
  PMCResponse,
} from "@/types";
import { CoachHeaderStrip } from "./CoachHeaderStrip";
import { RunningCoachView } from "./RunningCoachView";
import { CyclingCoachView } from "./CyclingCoachView";
import { CoachDailyBriefingCard } from "./CoachDailyBriefingCard";
import { PerformanceManagementChart } from "./PerformanceManagementChart";
import { generateDailyCoachBriefing } from "@/lib/domain/coach/dailyCoachBriefingEngine";

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
  const [pmc, setPmc] = useState<PMCResponse | null>(null);
  const [loadingPmc, setLoadingPmc] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPmc() {
      try {
        const res = await fetch("/api/coach/pmc?days=42");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.pmc) {
            setPmc(data.pmc);
          }
        }
      } catch (err) {
        console.warn("Failed to load PMC via API:", err);
      } finally {
        if (isMounted) setLoadingPmc(false);
      }
    }
    loadPmc();
    return () => {
      isMounted = false;
    };
  }, []);

  const briefing = useMemo(() => {
    const todayWorkout = workouts.find((w) => w.status === "PLANNED");
    return generateDailyCoachBriefing(pmc, healthContext, todayWorkout);
  }, [pmc, healthContext, workouts]);

  return (
    <div className="space-y-6">
      {/* 1. Header Strip with Prominent Running & Cycling Coach Selector Tabs */}
      <CoachHeaderStrip
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
      />

      {/* 2. Real-World Coach Daily Tactical Briefing & Auto-Regulation */}
      <CoachDailyBriefingCard briefing={briefing} />

      {/* 3. Performance Management Chart (Banister Impulse Model CTL/ATL/TSB) */}
      <PerformanceManagementChart pmc={pmc} isLoading={loadingPmc} />

      {/* 4. Specialized Coach View (Running or Cycling) */}
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
