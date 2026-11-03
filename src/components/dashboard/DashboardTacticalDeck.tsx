"use client";

import React, { useState } from "react";
import { Calendar, Target, Trophy, Layers, LayoutList } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"workouts" | "goals" | "prs" | "all">("workouts");

  return (
    <div className="space-y-3">
      {/* 1. Weekly Training Streak & Flame Retention Deck (Positioned directly ABOVE Image 2) */}
      <WeeklyStreakCard activities={activities} workouts={workouts} />

      {/* 2. Tactical Deck Mode & Tab Switcher */}
      <div className="p-2.5 bg-[#12151D] border border-[#1F2430] rounded-sm flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-[#9BA3AF] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Taktis:</span>
          </span>

          <div className="flex items-center gap-1 p-0.5 rounded-sm bg-[#090A0F] border border-[#1F2430]">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`px-2.5 py-1 rounded-sm transition-all flex items-center gap-1.5 text-xs ${
                activeTab === "workouts"
                  ? "bg-[#1C212E] text-[#00F0FF] border border-[#00F0FF]/40 font-bold"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <Calendar className="w-3 h-3 text-[#00F0FF]" />
              <span>Jadwal ({workouts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`px-2.5 py-1 rounded-sm transition-all flex items-center gap-1.5 text-xs ${
                activeTab === "goals"
                  ? "bg-[#1C212E] text-[#10B981] border border-[#10B981]/40 font-bold"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <Target className="w-3 h-3 text-[#10B981]" />
              <span>Sasaran ({goals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("prs")}
              className={`px-2.5 py-1 rounded-sm transition-all flex items-center gap-1.5 text-xs ${
                activeTab === "prs"
                  ? "bg-[#1C212E] text-[#D4FF00] border border-[#D4FF00]/40 font-bold"
                  : "text-[#9BA3AF] hover:text-white"
              }`}
            >
              <Trophy className="w-3 h-3 text-[#D4FF00]" />
              <span>Rekor ({prs.length})</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setActiveTab(activeTab === "all" ? "workouts" : "all")}
          className={`px-2 py-1 rounded-sm border transition-colors flex items-center gap-1 text-[10.5px] ${
            activeTab === "all"
              ? "bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF] font-bold"
              : "bg-[#090A0F] border-[#1F2430] text-[#9BA3AF] hover:text-white"
          }`}
          title="Tampilkan semua bagian sekaligus"
        >
          <LayoutList className="w-3 h-3" />
          <span>{activeTab === "all" ? "Mode Tab" : "Lihat Semua"}</span>
        </button>
      </div>

      {/* Render Active View */}
      {activeTab === "workouts" && (
        <div className="animate-in fade-in duration-150">
          <DashboardScheduledWorkoutsCard
            workouts={workouts}
            activePlan={activePlan}
          />
        </div>
      )}

      {activeTab === "goals" && (
        <div className="animate-in fade-in duration-150">
          <DashboardMacroGoalsCard goals={goals} />
        </div>
      )}

      {activeTab === "prs" && (
        <div className="animate-in fade-in duration-150">
          <PersonalRecordsDeck prs={prs} />
        </div>
      )}

      {activeTab === "all" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <DashboardScheduledWorkoutsCard
            workouts={workouts}
            activePlan={activePlan}
          />
          <DashboardMacroGoalsCard goals={goals} />
          <PersonalRecordsDeck prs={prs} />
        </div>
      )}
    </div>
  );
}
