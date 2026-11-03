"use client";

import React, { useMemo } from "react";
import { Flame } from "lucide-react";
import { Activity, ScheduledWorkout } from "@/types";
import { calculateWeeklyStreak } from "@/lib/streakEngine";

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
    <div className="bg-[#0D1017] border border-[#1F2430] rounded-sm p-4 font-mono shadow-xl relative overflow-hidden">
      {/* 3-Column Streak Metrics (Faithful to Reference Design with Dynamic Thermal Progression) */}
      <div className="grid grid-cols-3 divide-x divide-[#1F2430] items-center py-1">
        {/* Left Column: Total Contributions / Activities */}
        <div className="flex flex-col items-center justify-center px-2 text-center">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#38BDF8] tracking-tight">
            {streak.totalContributions.toLocaleString()}
          </span>
          <span className="text-xs sm:text-[13px] text-[#94A3B8] font-medium mt-1">
            Total Contributions
          </span>
          <span className="text-[10px] sm:text-[10.5px] text-[#5EEAD4]/80 font-mono mt-1 truncate max-w-full">
            {streak.totalDateRange}
          </span>
        </div>

        {/* Center Column: Current Streak Hero with Dynamic Thermal Flame & Ring */}
        <div
          className="flex flex-col items-center justify-center px-2 relative text-center group cursor-default"
          title={`${heatTier.description} • Suhu: ${heatTier.temperatureText}${
            heatTier.weeksToNextTier
              ? ` • ${heatTier.weeksToNextTier} minggu lagi menuju tahap ${heatTier.stage + 1}`
              : " (Puncak Konsistensi)"
          }`}
        >
          <div className="relative flex items-center justify-center pt-2 pb-1">
            {/* Top Flame Icon Nestled at Apex with Dynamic Heat Spectrum */}
            <div
              className="absolute -top-1.5 z-10 px-1 py-0.5 rounded-full bg-[#0D1017] border transition-all duration-300"
              style={{
                borderColor: streak.isFlameBurning
                  ? heatTier.colorHex
                  : streak.isFlameAtRisk
                  ? "#F59E0B"
                  : "#1F2430",
                boxShadow: streak.isFlameBurning
                  ? `0 0 12px ${heatTier.glowRgba}`
                  : streak.isFlameAtRisk
                  ? "0 0 8px rgba(245, 158, 11, 0.35)"
                  : "none",
              }}
            >
              <Flame
                className={`w-4 h-4 transition-all duration-300 ${
                  streak.isFlameBurning ? "animate-pulse" : ""
                }`}
                style={{
                  color: streak.isFlameBurning
                    ? heatTier.colorHex
                    : streak.isFlameAtRisk
                    ? "#F59E0B"
                    : "#5A6272",
                  fill: streak.isFlameBurning
                    ? heatTier.colorHex
                    : streak.isFlameAtRisk
                    ? "#F59E0B"
                    : "none",
                  filter: streak.isFlameBurning
                    ? `drop-shadow(0 0 8px ${heatTier.glowRgba})`
                    : "none",
                }}
              />
            </div>

            {/* Circular Ring with Dynamic Thermal Glow */}
            <div
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-[#090A0F]/80"
              style={{
                borderColor: streak.isFlameBurning
                  ? heatTier.colorHex
                  : streak.isFlameAtRisk
                  ? "#F59E0B"
                  : "#1F2430",
                boxShadow: streak.isFlameBurning
                  ? `0 0 18px ${heatTier.glowRgba}`
                  : streak.isFlameAtRisk
                  ? "0 0 12px rgba(245, 158, 11, 0.25)"
                  : "none",
              }}
            >
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#C084FC] tracking-tight">
                {streak.currentStreakWeeks}
              </span>
            </div>
          </div>

          <span className="text-xs sm:text-[13px] font-bold text-[#E2E8F0] mt-1">
            Current Streak
          </span>

          <span
            className="text-[10px] sm:text-[10.5px] font-mono mt-0.5 truncate max-w-full transition-colors duration-300"
            style={{
              color: streak.isFlameBurning ? heatTier.colorHex : "#38BDF8",
            }}
          >
            {streak.currentStreakDateRange}
          </span>
        </div>

        {/* Right Column: Longest Streak */}
        <div className="flex flex-col items-center justify-center px-2 text-center">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#38BDF8] tracking-tight">
            {streak.longestStreakWeeks}
          </span>
          <span className="text-xs sm:text-[13px] text-[#94A3B8] font-medium mt-1">
            Longest Streak
          </span>
          <span className="text-[10px] sm:text-[10.5px] text-[#5EEAD4]/80 font-mono mt-1 truncate max-w-full">
            {streak.longestStreakDateRange}
          </span>
        </div>
      </div>
    </div>
  );
}
