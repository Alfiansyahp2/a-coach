"use client";

import React, { useMemo } from "react";
import { Flame } from "lucide-react";
import { Activity, ScheduledWorkout } from "@/types";
import { calculateWeeklyStreak } from "@/lib/domain/streak/streakEngine";

interface WeeklyStreakCardProps {
  activities?: Activity[];
  workouts?: ScheduledWorkout[];
}

export function WeeklyStreakCard({ activities = [], workouts = [] }: WeeklyStreakCardProps) {
  const streak = useMemo(() => {
    return calculateWeeklyStreak(activities, workouts);
  }, [activities, workouts]);

  const { heatTier } = streak;

  return (
    <div className="relative rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 font-mono shadow-xs">
      {/* 3-Column Streak Metrics with Thermodynamic Flame Heat Spectrum */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-center">
        {/* Left Column: Total Contributions / Activities */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-center">
          <span className="text-2xl sm:text-3xl font-extrabold font-tabular text-[var(--color-text-primary)] tracking-tight">
            {streak.totalContributions.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
            Total Kontribusi
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 truncate max-w-full font-tabular">
            {streak.totalDateRange}
          </span>
        </div>

        {/* Center Hero Column: Current Streak with Dynamic Thermodynamic Flame & Glowing Ring */}
        <div
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] relative text-center group cursor-default shadow-xs"
          title={`${heatTier.description} • Suhu: ${heatTier.temperatureText}${
            heatTier.weeksToNextTier
              ? ` • ${heatTier.weeksToNextTier} minggu lagi menuju tahap ${heatTier.stage + 1}`
              : " (Puncak Konsistensi)"
          }`}
        >
          <div className="relative flex items-center justify-center pt-2 pb-1">
            {/* Top Flame Icon Nestled at Apex with Thermodynamic Color */}
            <div
              className="absolute -top-2 z-10 px-2 py-0.5 rounded-full bg-[#0D1017] border transition-all duration-300"
              style={{
                borderColor: streak.isFlameBurning
                  ? heatTier.colorHex
                  : streak.isFlameAtRisk
                  ? "#F97316"
                  : "var(--color-border)",
                boxShadow: streak.isFlameBurning
                  ? `0 0 12px ${heatTier.glowRgba}`
                  : streak.isFlameAtRisk
                  ? "0 0 8px rgba(249, 115, 22, 0.4)"
                  : "none",
              }}
            >
              <Flame
                className={`w-3.5 h-3.5 transition-all duration-300 ${
                  streak.isFlameBurning ? "animate-pulse" : ""
                }`}
                style={{
                  color: streak.isFlameBurning
                    ? heatTier.colorHex
                    : streak.isFlameAtRisk
                    ? "#F97316"
                    : "var(--color-text-muted)",
                  fill: streak.isFlameBurning
                    ? heatTier.colorHex
                    : streak.isFlameAtRisk
                    ? "#F97316"
                    : "none",
                  filter: streak.isFlameBurning
                    ? `drop-shadow(0 0 8px ${heatTier.glowRgba})`
                    : "none",
                }}
              />
            </div>

            {/* Circular Glowing Ring with Deep Contrast Instrument Well */}
            <div
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 flex items-center justify-center bg-[#0D1017] shadow-md transition-all duration-300"
              style={{
                borderColor: streak.isFlameBurning
                  ? heatTier.colorHex
                  : streak.isFlameAtRisk
                  ? "#F97316"
                  : "var(--color-border)",
                boxShadow: streak.isFlameBurning
                  ? `0 0 18px ${heatTier.glowRgba}`
                  : streak.isFlameAtRisk
                  ? "0 0 12px rgba(249, 115, 22, 0.3)"
                  : "none",
              }}
            >
              <span
                className="text-2xl sm:text-3xl font-black font-tabular tracking-tight transition-colors duration-300"
                style={{
                  color: streak.isFlameBurning ? heatTier.colorHex : "#F8FAFC",
                  textShadow: streak.isFlameBurning ? `0 0 12px ${heatTier.glowRgba}` : "none",
                }}
              >
                {streak.currentStreakWeeks}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[var(--color-text-primary)] mt-1.5">
            Streak Aktif
          </span>

          <span
            className="text-[10px] font-mono mt-0.5 truncate max-w-full font-semibold transition-colors duration-300 font-tabular"
            style={{
              color: streak.isFlameBurning ? heatTier.colorHex : "var(--color-text-secondary)",
            }}
          >
            {streak.currentStreakDateRange}
          </span>
        </div>

        {/* Right Column: Longest Streak */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-center">
          <span className="text-2xl sm:text-3xl font-extrabold font-tabular text-[var(--color-text-primary)] tracking-tight">
            {streak.longestStreakWeeks}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
            Rekor Streak
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 truncate max-w-full font-tabular">
            {streak.longestStreakDateRange}
          </span>
        </div>
      </div>
    </div>
  );
}
