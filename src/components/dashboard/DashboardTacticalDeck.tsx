"use client";

import React, { useState } from "react";
import { Calendar, Target, Trophy, Layers, Activity as ActivityIcon } from "lucide-react";
import { ScheduledWorkout, TrainingPlan, FitnessGoal, PersonalRecord, Activity } from "@/types";
import { WeeklyActivityAndInjuryRecap } from "@/lib/domain/analytics/weeklyRecapTypes";
import { DashboardScheduledWorkoutsCard } from "./DashboardScheduledWorkoutsCard";
import { DashboardMacroGoalsCard } from "./DashboardMacroGoalsCard";
import { PersonalRecordsDeck } from "@/components/PersonalRecordsDeck";
import { WeeklyStreakCard } from "./WeeklyStreakCard";
import { WeeklyRecapCard } from "@/components/analytics/WeeklyRecapCard";

interface DashboardTacticalDeckProps {
  workouts: ScheduledWorkout[];
  activePlan: TrainingPlan | null;
  goals: FitnessGoal[];
  prs: PersonalRecord[];
  activities?: Activity[];
  initialRecap?: WeeklyActivityAndInjuryRecap;
}

export function DashboardTacticalDeck({
  workouts,
  activePlan,
  goals,
  prs,
  activities = [],
  initialRecap,
}: DashboardTacticalDeckProps) {
  const [activeTab, setActiveTab] = useState<"workouts" | "goals" | "prs" | "recap">("workouts");

  return (
    <div className="space-y-4">
      {/* 1. Weekly Training Streak & Retention Deck */}
      <WeeklyStreakCard activities={activities} workouts={workouts} />

      {/* 2. Tactical Deck Segmented Mode Switcher (Zero Overflow • High Density HUD) */}
      <div className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-[var(--color-text-secondary)] text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--color-cycling)]" />
            <span>MODUL TAKTIS</span>
          </span>
          <span className="text-[9.5px] text-[var(--color-text-muted)] uppercase font-semibold">
            {activeTab === "workouts"
              ? "Kalender Sesi"
              : activeTab === "goals"
              ? "Sasaran Utama"
              : activeTab === "prs"
              ? "Rekor Terverifikasi"
              : "Audit Mingguan"}
          </span>
        </div>

        <div className="p-1 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] grid grid-cols-4 gap-1 text-xs shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("workouts")}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold cursor-pointer ${
              activeTab === "workouts"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]/50"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />
            <span className="truncate">Jadwal</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-tabular shrink-0 ${
                activeTab === "workouts"
                  ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold"
                  : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
              }`}
            >
              {workouts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("goals")}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold cursor-pointer ${
              activeTab === "goals"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]/50"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[var(--color-endurance)] shrink-0" />
            <span className="truncate">Sasaran</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-tabular shrink-0 ${
                activeTab === "goals"
                  ? "bg-[var(--color-endurance)]/15 text-[var(--color-endurance)] border border-[var(--color-endurance)]/30 font-bold"
                  : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
              }`}
            >
              {goals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prs")}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold cursor-pointer ${
              activeTab === "prs"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]/50"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[var(--color-running)] shrink-0" />
            <span className="truncate">Rekor</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-tabular shrink-0 ${
                activeTab === "prs"
                  ? "bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold"
                  : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
              }`}
            >
              {prs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recap")}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold cursor-pointer ${
              activeTab === "recap"
                ? "bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xs font-bold"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]/50"
            }`}
          >
            <ActivityIcon className="w-3.5 h-3.5 text-[var(--color-cycling)] shrink-0" />
            <span className="truncate">Rekap</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-tabular shrink-0 ${
                activeTab === "recap"
                  ? "bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 font-bold"
                  : "bg-[var(--color-surface-card)] text-[var(--color-text-muted)]"
              }`}
            >
              1M
            </span>
          </button>
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

      {activeTab === "recap" && (
        <WeeklyRecapCard initialRecap={initialRecap} />
      )}
    </div>
  );
}
