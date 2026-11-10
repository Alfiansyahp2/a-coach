"use client";

import React, { useMemo } from "react";
import { Flame, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Activity, ScheduledWorkout } from "@/types";
import { calculateWeeklyStreak, getFlameHeatTier } from "@/lib/domain/streak/streakEngine";

interface WeeklyStreakCardProps {
  activities?: Activity[];
  workouts?: ScheduledWorkout[];
}

export function WeeklyStreakCard({ activities = [], workouts = [] }: WeeklyStreakCardProps) {
  const streak = useMemo(() => {
    return calculateWeeklyStreak(activities, workouts);
  }, [activities, workouts]);

  // Authoritative Thermodynamic Flame Heat Tier based on current active streak weeks
  const heatTier = useMemo(() => {
    return streak.currentStreakWeeks > 0
      ? getFlameHeatTier(streak.currentStreakWeeks, true)
      : streak.heatTier;
  }, [streak.currentStreakWeeks, streak.heatTier]);

  const tierProgress = useMemo(() => {
    if (!heatTier.nextTierWeeks) return 1;
    const range = heatTier.nextTierWeeks - heatTier.minWeeks;
    if (range <= 0) return 1;
    return Math.min(1, Math.max(0, (streak.currentStreakWeeks - heatTier.minWeeks) / range));
  }, [heatTier, streak.currentStreakWeeks]);

  const streakRingRadius = 32;
  const streakCircumference = 2 * Math.PI * streakRingRadius;
  const streakOffset = streakCircumference - tierProgress * streakCircumference;

  return (
    <div className="relative rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-4 sm:p-5 font-mono shadow-xs transition-colors duration-200 space-y-3.5">
      {/* 3-Column Streak Metrics with Thermodynamic Flame Heat Spectrum */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-center">
        {/* Left Column: Total Contributions / Activities */}
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-center transition-colors">
          <span className="text-2xl sm:text-3xl font-bold font-tabular text-[var(--color-text-primary)] tracking-tight">
            {streak.totalContributions.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
            Total Aktivitas
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 truncate max-w-full font-tabular">
            {streak.totalDateRange}
          </span>
        </div>

        {/* Center Hero Column: Current Streak with Dynamic Thermodynamic Flame & Glowing Ring */}
        <div
          className="flex flex-col items-center justify-center p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] relative text-center group cursor-default shadow-xs transition-colors"
          title={`${heatTier.description} • Suhu: ${heatTier.temperatureText}${
            heatTier.weeksToNextTier
              ? ` • ${heatTier.weeksToNextTier} minggu lagi menuju tahap ${heatTier.stage + 1}`
              : " (Puncak Konsistensi)"
          }`}
        >
          <div className="relative flex items-center justify-center pt-2 pb-1">
            {/* Top Flame Badge Nestled at Apex with Exact Thermodynamic Stage Color */}
            <div
              className="absolute -top-2 z-10 px-2 py-0.5 rounded-full bg-[var(--color-surface-card)] border transition-all duration-300"
              style={{
                borderColor: heatTier.colorHex,
                boxShadow: `0 0 12px ${heatTier.glowRgba}`,
              }}
            >
              <Flame
                className={`w-3.5 h-3.5 transition-all duration-300 ${
                  streak.currentStreakWeeks > 0 ? "animate-pulse" : ""
                }`}
                style={{
                  color: heatTier.colorHex,
                  fill: heatTier.colorHex,
                  filter: `drop-shadow(0 0 8px ${heatTier.glowRgba})`,
                }}
              />
            </div>

            {/* Circular Glowing Ring with SVG Heat Tier Progress Arc */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 origin-center absolute inset-0" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r={streakRingRadius}
                  className="stroke-[var(--color-surface-card)] fill-none"
                  strokeWidth="3"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={streakRingRadius}
                  stroke={heatTier.colorHex}
                  strokeWidth="3.5"
                  strokeDasharray={streakCircumference}
                  strokeDashoffset={streakOffset}
                  strokeLinecap="round"
                  className="fill-none transition-[stroke-dashoffset] duration-700 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 6px ${heatTier.glowRgba})`,
                  }}
                />
              </svg>
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-[var(--color-surface-card)] shadow-xs transition-all duration-300 z-10 border"
                style={{
                  borderColor: `${heatTier.colorHex}40`,
                  boxShadow: `0 0 14px ${heatTier.glowRgba}`,
                }}
              >
                <span
                  className="text-2xl sm:text-3xl font-black font-tabular tracking-tight transition-colors duration-300"
                  style={{
                    color: heatTier.colorHex,
                  }}
                >
                  {streak.currentStreakWeeks}
                </span>
              </div>
            </div>
          </div>

          <span
            className="text-xs font-bold mt-1.5 transition-colors"
            style={{ color: heatTier.colorHex }}
          >
            {heatTier.name} ({heatTier.temperatureText})
          </span>

          <span
            className="text-[10px] font-mono mt-0.5 truncate max-w-full font-semibold transition-colors duration-300 font-tabular text-[var(--color-text-secondary)]"
          >
            {streak.currentStreakDateRange}
          </span>
        </div>

        {/* Right Column: Longest Streak */}
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-center transition-colors">
          <span className="text-2xl sm:text-3xl font-bold font-tabular text-[var(--color-text-primary)] tracking-tight">
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

      {/* Thermodynamic Stage Progression Banner & Retention Health Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)] text-xs">
        <div className="flex items-center gap-2">
          {streak.isFlameBurning ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-cycling)]/15 text-[var(--color-cycling)] border border-[var(--color-cycling)]/30 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>SESI MINGGU INI TERCATAT</span>
            </span>
          ) : streak.isFlameAtRisk ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-alert-amber)]/15 text-[var(--color-alert-amber)] border border-[var(--color-alert-amber)]/30 text-[10px] font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>SIAGA: SISA {streak.daysRemainingThisWeek} HARI</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] text-[10px] font-bold">
              <span>API PADAM (0°C)</span>
            </span>
          )}

          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium truncate">
            {streak.isFlameBurning
              ? `${streak.currentStreakWeeks} minggu beruntun aktif membara`
              : streak.isFlameAtRisk
              ? `Latihan sebelum Senin agar ${heatTier.name} tidak padam`
              : "Selesaikan 1 sesi minggu ini untuk menyalakan api"}
          </span>
        </div>

        {heatTier.weeksToNextTier && (
          <span
            className="text-[10px] font-semibold font-tabular shrink-0 sm:text-right"
            style={{ color: heatTier.colorHex }}
          >
            +{heatTier.weeksToNextTier} minggu → Tahap {heatTier.stage + 1}
          </span>
        )}
      </div>
    </div>
  );
}
