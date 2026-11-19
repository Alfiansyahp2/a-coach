"use client";

import React from "react";
import { Trophy, Target, Flame } from "lucide-react";

export interface TeamRacquetFunctionalData {
  sprintCount?: number;
  highSpeedRunningMeters?: number;
  smashOrServeCount?: number;
  arrowCount?: number;
  drawWeightLbs?: number;
  workoutFormat?: string;
  roundsOrRepsCompleted?: number;
  climbingGrade?: string;
  hangboardTutSeconds?: number;
}

interface TeamRacquetFunctionalFieldsProps {
  isTeam: boolean;
  isRacquetOrPrecision: boolean;
  isFunctionalExtreme: boolean;
  data: TeamRacquetFunctionalData;
  onChange: (data: TeamRacquetFunctionalData) => void;
}

export function TeamRacquetFunctionalFields({
  isTeam,
  isRacquetOrPrecision,
  isFunctionalExtreme,
  data,
  onChange,
}: TeamRacquetFunctionalFieldsProps) {
  const updateField = (key: keyof TeamRacquetFunctionalData, value: any) => {
    onChange({ ...data, [key]: value });
  };

  if (isTeam) {
    return (
      <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            TELEMETRI BEREGU &amp; SPRINT HSR
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">Buchheit / Bradley HSR</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Sprint Count</label>
            <input
              type="number"
              min="0"
              value={data.sprintCount || ""}
              onChange={(e) => updateField("sprintCount", parseInt(e.target.value) || 0)}
              placeholder="e.g. 14"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">HSR Distance (m)</label>
            <input
              type="number"
              min="0"
              value={data.highSpeedRunningMeters || ""}
              onChange={(e) => updateField("highSpeedRunningMeters", parseInt(e.target.value) || 0)}
              placeholder="e.g. 450"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
        </div>
      </div>
    );
  }

  if (isRacquetOrPrecision) {
    return (
      <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-purple-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            TELEMETRI RAKET &amp; PRESISI
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">BWF / ITF / Archery</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Smash / Servis / Panah</label>
            <input
              type="number"
              min="0"
              value={data.smashOrServeCount ?? data.arrowCount ?? ""}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                updateField("smashOrServeCount", val);
                updateField("arrowCount", val);
              }}
              placeholder="e.g. 60"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Draw Weight / Tensi</label>
            <input
              type="number"
              min="0"
              value={data.drawWeightLbs || ""}
              onChange={(e) => updateField("drawWeightLbs", parseFloat(e.target.value) || 0)}
              placeholder="e.g. 38 lbs"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
        </div>
      </div>
    );
  }

  if (isFunctionalExtreme) {
    return (
      <div className="p-3 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-rose-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            KEBUGARAN FUNGSIONAL &amp; EKSTREM
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">CrossFit / IFSC / FIG</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Format Latihan</label>
            <select
              value={data.workoutFormat || "AMRAP"}
              onChange={(e) => updateField("workoutFormat", e.target.value)}
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
            >
              <option value="AMRAP">AMRAP</option>
              <option value="FOR_TIME">FOR TIME</option>
              <option value="EMOM">EMOM</option>
              <option value="BOULDER">BOULDER</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Rounds / Reps</label>
            <input
              type="number"
              min="0"
              value={data.roundsOrRepsCompleted || ""}
              onChange={(e) => updateField("roundsOrRepsCompleted", parseInt(e.target.value) || 0)}
              placeholder="e.g. 8"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
          <div>
            <label className="block text-[9px] text-[var(--color-text-secondary)] uppercase">Grade / TUT (dtk)</label>
            <input
              type="text"
              value={data.climbingGrade || (data.hangboardTutSeconds ? String(data.hangboardTutSeconds) : "")}
              onChange={(e) => {
                updateField("climbingGrade", e.target.value);
                updateField("hangboardTutSeconds", parseInt(e.target.value) || 0);
              }}
              placeholder="e.g. V5 / 120s"
              className="w-full px-2 py-1 rounded bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-tabular"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
