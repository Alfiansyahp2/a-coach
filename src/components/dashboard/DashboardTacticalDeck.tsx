"use client";

import React, { useState } from "react";
import { Calendar, Target, Trophy, Layers } from "lucide-react";
import { ScheduledWorkout, TrainingPlan, FitnessGoal, PersonalRecord, Activity } from "@/types";
import { DashboardScheduledWorkoutsCard } from "./DashboardScheduledWorkoutsCard";
import { DashboardMacroGoalsCard } from "./DashboardMacroGoalsCard";
import { PersonalRecordsDeck } from "@/components/PersonalRecordsDeck";
import { WeeklyStreakCard } from "./WeeklyStreakCard";

interface DashboardTacticalDeckProps {
  workouts: ScheduledWorkout[];
  activePlan: TrainingPlan | null;
  goals: FitnessGoal[];
  prs: PersonalRecord[];
  activities?: Activity[];
}

export function DashboardTacticalDeck({
  workouts,
  activePlan,
  goals,
  prs,
  activities = [],
}: DashboardTacticalDeckProps) {
  const [activeTab, setActiveTab] = useState<"workouts" | "goals" | "prs">("workouts");

  return (
    <div className="space-y-4">
      {/* 1. Weekly Training Streak & Retention Deck */}
      <WeeklyStreakCard activities={activities} workouts={workouts} />

      {/* 2. Tactical Deck Mode & Tab Switcher */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-text-secondary)] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 pl-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>Taktis:</span>
          </span>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-semibold ${
                activeTab === "workouts"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
              <span>Jadwal ({workouts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-semibold ${
                activeTab === "goals"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Target className="w-3.5 h-3.5 text-[var(--color-endurance)]" />
              <span>Sasaran ({goals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("prs")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-semibold ${
                activeTab === "prs"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[var(--color-running)]" />
              <span>Rekor ({prs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "workouts" && (
        <DashboardScheduledWorkoutsCard
          workouts={workouts}
          activePlan={activePlan}
        />
      )}

      {activeTab === "goals" && (
        <DashboardMacroGoalsCard goals={goals} />
      )}

      {activeTab === "prs" && (
        <PersonalRecordsDeck prs={prs} />
      )}
    </div>
  );
}
