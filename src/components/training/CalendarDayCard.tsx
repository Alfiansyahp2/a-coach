"use client";

import React from "react";
import { ScheduledWorkout } from "@/types";
import { CheckCircle2, Heart, Zap } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/formatters";

export interface CalendarDayCardProps {
  day: {
    dateStr: string;
    dayNumber: number;
    monthName: string;
    dayOfWeek: number;
    dayName: string;
    isToday: boolean;
    workouts: ScheduledWorkout[];
  };
  minTargetKm: number;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  isRunningCategory: (category: string) => boolean;
}

export function CalendarDayCard({
  day,
  minTargetKm,
  onSelectWorkout,
  isRunningCategory,
}: CalendarDayCardProps) {
  const hasWorkouts = day.workouts.length > 0;
  const isFastingDay = day.dayOfWeek === 0 || day.dayOfWeek === 3; // Senin or Kamis
  const isSaturday = day.dayOfWeek === 5; // Sabtu

  return (
    <div
      className={`min-h-[155px] p-2 rounded-sm flex flex-col justify-between transition-all ${
        day.isToday
          ? "bg-[#161922] border-2 border-[#D4FF00] shadow-md shadow-[#D4FF00]/5"
          : isFastingDay
          ? "bg-[#151221]/70 border border-[#A855F7]/25"
          : isSaturday
          ? "bg-[#12151D] border border-[#2D3547]/50"
          : hasWorkouts
          ? "bg-[#161922] border border-[#1F2430] hover:border-[#2D3547]"
          : "bg-[#0E1017] border border-[#1F2430]/40 opacity-75"
      }`}
    >
      {/* Day Header (Date & Today Badge) */}
      <div className="flex items-center justify-between pb-1 border-b border-[#1F2430]/40 text-[10px]">
        <span className={`md:hidden font-bold ${isFastingDay ? "text-[#D8B4FE]" : "text-[#9BA3AF]"}`}>
          {day.dayName}
        </span>
        <div className="flex items-center gap-1">
          {day.isToday && (
            <span className="px-1 py-0.1 rounded-sm bg-[#D4FF00] text-[#090A0F] font-black text-[8px]">
              TODAY
            </span>
          )}
          <span className={`font-bold ${day.isToday ? "text-[#D4FF00]" : isFastingDay ? "text-[#D8B4FE]" : "text-[#F0F2F5]"}`}>
            {day.dayNumber} {day.monthName}
          </span>
        </div>
      </div>

      {/* Day Content: Workouts / Fasting / Saturday Buffer / Rest */}
      <div className="py-1.5 flex-1 space-y-1.5">
        {hasWorkouts ? (
          day.workouts.map((w) => {
            const isRun = isRunningCategory(w.workout_category);
            const isCycling = w.workout_category === "Cycling";
            const isCompleted = w.status === "COMPLETED";

            return (
              <button
                key={w.id}
                onClick={() => onSelectWorkout(w)}
                className={`w-full text-left p-2 rounded-sm border transition-all space-y-1 block ${
                  isCompleted
                    ? "bg-[#10B981]/10 border-[#10B981]/40 hover:border-[#10B981]"
                    : isRun
                    ? "bg-[#D4FF00]/10 border-[#D4FF00]/40 hover:border-[#D4FF00]"
                    : isCycling
                    ? "bg-[#00F0FF]/10 border-[#00F0FF]/30 hover:border-[#00F0FF]"
                    : "bg-[#FF9500]/10 border-[#FF9500]/30 hover:border-[#FF9500]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[8px] font-black uppercase px-1 py-0.2 rounded-sm ${
                      isRun
                        ? "bg-[#D4FF00]/25 text-[#D4FF00]"
                        : isCycling
                        ? "bg-[#00F0FF]/20 text-[#00F0FF]"
                        : "bg-[#FF9500]/20 text-[#FF9500]"
                    }`}
                  >
                    {isRun ? "LARI BERTAHAP" : isCycling ? "EASY MTB" : "UPPER/REHAB"}
                  </span>

                  {isCompleted && (
                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  )}
                </div>

                <div className="font-bold text-[11px] text-[#F0F2F5] leading-tight">
                  {w.target_duration_seconds
                    ? formatDuration(w.target_duration_seconds)
                    : w.target_distance_meters
                    ? formatDistance(w.target_distance_meters)
                    : "--"}
                </div>

                <div className="text-[8px] text-[#9BA3AF] truncate">
                  {w.target_intensity || "Zone 2 • RPE 3–4"}
                </div>
              </button>
            );
          })
        ) : isFastingDay ? (
          /* Dedicated Fasting Card (Senin & Kamis) */
          <div className="h-full flex flex-col items-center justify-center py-2.5 text-center px-1 rounded-sm bg-[#A855F7]/10 border border-[#A855F7]/25 space-y-0.5">
            <span className="text-sm leading-none">🌙</span>
            <span className="text-[10px] font-bold text-[#D8B4FE] tracking-wide">Puasa Sunnah</span>
            <span className="text-[8px] text-[#C084FC]/90">Istirahat Penuh</span>
            <span className="text-[7.5px] text-[#9BA3AF]">
              {day.dayOfWeek === 0 ? "Regenerasi Glikogen" : "Pemulihan Tubuh"}
            </span>
          </div>
        ) : isSaturday ? (
          /* Dedicated Saturday Buffer Card */
          <div className="h-full flex flex-col justify-between p-1.5 rounded-sm bg-[#161922]/70 border border-[#2D3547]/60 hover:border-[#D4FF00]/40 transition-all text-left">
            <div>
              <div className="flex items-center justify-between text-[8px] pb-0.5 border-b border-[#1F2430]/60">
                <span className="font-bold text-[#9BA3AF]">SABTU BUFFER</span>
                <span className="px-1 py-0.2 rounded-sm bg-[#D4FF00]/10 text-[#D4FF00] font-black text-[7px]">
                  OPSIONAL
                </span>
              </div>
              <div className="my-1 space-y-0.5">
                <div className="text-[9.5px] font-bold text-[#F0F2F5] leading-tight flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-[#D4FF00]" />
                  Buffer Mingguan
                </div>
                <p className="text-[7.5px] text-[#9BA3AF] leading-tight">
                  Slot cadangan: Recovery spin ringan jika target ({minTargetKm} km) belum tercapai.
                </p>
              </div>
            </div>
            <div className="pt-0.5 border-t border-[#1F2430]/40 flex items-center justify-between text-[7px] text-[#5A6272]">
              <span>RPE 1–2</span>
              <span className="text-[#D4FF00]">Persiapan Minggu</span>
            </div>
          </div>
        ) : (
          /* Other Rest Days */
          <div className="h-full flex flex-col items-center justify-center py-3 text-center text-[10px] text-[#5A6272]">
            <Heart className="w-3.5 h-3.5 text-[#3A404D] mb-1" />
            <span>Jeda Pemulihan</span>
            <span className="text-[8px] text-[#3A404D]">Proteksi Sendi</span>
          </div>
        )}
      </div>

      {/* Day Footer Subtext */}
      <div className="pt-1 border-t border-[#1F2430]/30 text-[8.5px] text-[#5A6272] text-right">
        {hasWorkouts ? (
          <span
            className="text-[#00F0FF] hover:underline cursor-pointer font-semibold"
            onClick={() => onSelectWorkout(day.workouts[0])}
          >
            Detail Sesi ↗
          </span>
        ) : isFastingDay ? (
          <span className="text-[#A855F7] font-semibold flex items-center justify-end gap-1">
            <span>🌙</span> Puasa Sunnah
          </span>
        ) : isSaturday ? (
          <span className="text-[#D4FF00]/80 font-semibold">Slot Buffer</span>
        ) : (
          <span>Istirahat</span>
        )}
      </div>
    </div>
  );
}

