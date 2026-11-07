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

      {/* 2. Tactical Deck Mode & Tab Switcher (Compact & Sleek) */}
      <div className="p-1 sm:p-1.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[var(--color-text-secondary)] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 pl-1 shrink-0">
            <Layers className="w-3 h-3 text-[var(--color-cycling)]" />
            <span>Taktis:</span>
          </span>

          <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "workouts"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Calendar className="w-3 h-3 text-[var(--color-cycling)] shrink-0" />
              <span>Jadwal</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-tabular ${
                  activeTab === "workouts"
                    ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold"
                    : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
                }`}
              >
                {workouts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "goals"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Target className="w-3 h-3 text-[var(--color-endurance)] shrink-0" />
              <span>Sasaran</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-tabular ${
                  activeTab === "goals"
                    ? "bg-[var(--color-endurance)]/15 text-[var(--color-endurance)] border border-[var(--color-endurance)]/30 font-bold"
                    : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
                }`}
              >
                {goals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("prs")}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "prs"
                  ? "bg-[var(--color-surface-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Trophy className="w-3 h-3 text-[var(--color-running)] shrink-0" />
              <span>Rekor</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-tabular ${
                  activeTab === "prs"
                    ? "bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold"
                    : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
                }`}
              >
                {prs.length}
              </span>
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
        <PersonalRecordsDeck prs={prs} activities={activities} />
      )}
    </div>
  );
}
