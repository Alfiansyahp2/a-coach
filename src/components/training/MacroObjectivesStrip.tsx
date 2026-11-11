"use client";

import React from "react";
import { Bike, Footprints, Gauge, Target, Sparkles } from "lucide-react";
import { FitnessGoal, TrainingPlan } from "@/types";

interface MacroObjectivesStripProps {
  goals?: FitnessGoal[];
  plan?: TrainingPlan | null;
}

export function MacroObjectivesStrip({ goals = [], plan }: MacroObjectivesStripProps) {
  // Find primary goal from active plan or priority === 1
  const primaryGoal =
    (plan?.goal_id ? goals.find((g) => g.id === plan.goal_id) : null) ||
    goals.find((g) => g.priority === 1) ||
    goals[0];

  // Secondary goal
  const secondaryGoal = goals.find((g) => g.id !== primaryGoal?.id) || goals[1];

  const primaryTargetVal = Number(primaryGoal?.target_value || 100);
  const primaryCurrentVal = Number(primaryGoal?.current_value || 56.1);
  const primaryPct = Math.min(100, Math.round((primaryCurrentVal / primaryTargetVal) * 100));

  const isPrimaryRide = (primaryGoal?.sport_type || "").toLowerCase().includes("ride") || (primaryGoal?.title || "").toLowerCase().includes("100");
  const isPrimaryRun = (primaryGoal?.sport_type || "").toLowerCase().includes("run") || (primaryGoal?.title || "").toLowerCase().includes("marathon");

  const secondaryTargetVal = Number(secondaryGoal?.target_value || 42.2);
  const secondaryCurrentVal = Number(secondaryGoal?.current_value || 12.3);
  const secondaryPct = Math.min(100, Math.round((secondaryCurrentVal / secondaryTargetVal) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
      {/* 1. Primary Active Goal (Directly Linked to 12-Week Plan) */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border-2 border-[var(--color-endurance)]/60 space-y-2.5 shadow-sm transition-all relative overflow-hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 truncate pr-2">
            {isPrimaryRide ? (
              <Bike className="w-4 h-4 text-[var(--color-cycling)] shrink-0" />
            ) : isPrimaryRun ? (
              <Footprints className="w-4 h-4 text-[var(--color-running)] shrink-0" />
            ) : (
              <Target className="w-4 h-4 text-[var(--color-endurance)] shrink-0" />
            )}
            <span className="truncate">{primaryGoal?.title || "Road to 100 km Century"}</span>
          </span>
          <span className="text-[var(--color-endurance)] font-extrabold font-tabular text-xs shrink-0">
            {primaryPct}%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-endurance)] transition-all duration-500"
            style={{ width: `${primaryPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>1x Sesi: <strong className="text-[var(--color-text-primary)] font-tabular">{primaryCurrentVal.toFixed(1)} {primaryGoal?.unit || 'km'}</strong></span>
          <span>Target: <strong className="text-[var(--color-text-primary)] font-tabular">{primaryTargetVal.toFixed(1)} {primaryGoal?.unit || 'km'}</strong></span>
        </div>
      </div>

      {/* 2. Secondary Pathway / Companion Target */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-running)] space-y-2.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 truncate pr-2">
            <Footprints className="w-4 h-4 text-[var(--color-running)] shrink-0" />
            <span className="truncate">{secondaryGoal?.title || "Jalur Maraton (42.2K)"}</span>
          </span>
          <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[var(--color-running)]/15 text-[var(--color-running)] border border-[var(--color-running)]/30 font-bold font-tabular shrink-0">
            {secondaryPct}%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-running)] transition-all duration-500"
            style={{ width: `${secondaryPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>Sesi Puncak: <strong className="text-[var(--color-text-primary)] font-tabular">{secondaryCurrentVal.toFixed(1)} {secondaryGoal?.unit || 'km'}</strong></span>
          <span>Target: <strong className="text-[var(--color-text-primary)] font-tabular">{secondaryTargetVal.toFixed(1)} {secondaryGoal?.unit || 'km'}</strong></span>
        </div>
      </div>

      {/* 3. Intensity Method & Talk Test */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-cycling)] space-y-2.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[var(--color-cycling)]" />
            <span>Intensitas Zone 2 (RPE 3–4)</span>
          </span>
          <span className="text-[var(--color-cycling)] font-bold text-xs">Talk Test</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div className="h-full rounded-full bg-[var(--color-cycling)]" style={{ width: "100%" }} />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>Kayuhan: <strong className="text-[var(--color-text-primary)]">Ringan &amp; Stabil</strong></span>
          <span>Sensor: <strong className="text-[var(--color-text-muted)]">Tanpa HRM</strong></span>
        </div>
      </div>

      {/* 4. Fasting Routine Compliance */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-purple-500/40 space-y-2.5 shadow-xs transition-all">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <span className="text-sm">🌙</span>
            <span>Jadwal Puasa Sunnah</span>
          </span>
          <span className="text-purple-600 dark:text-purple-300 font-bold text-xs">100% Selaras</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden border border-[var(--color-border)]">
          <div className="h-full rounded-full bg-purple-500" style={{ width: "100%" }} />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
          <span>Puasa: <strong className="text-purple-600 dark:text-purple-300">Senin &amp; Kamis</strong></span>
          <span>Latihan: <strong className="text-[var(--color-cycling)]">Sel, Rab, Jum, Min</strong></span>
        </div>
      </div>
    </div>
  );
}
