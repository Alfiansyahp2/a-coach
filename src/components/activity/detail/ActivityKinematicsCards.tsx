import React from "react";
import { formatDistance, formatDuration, formatElevation } from "@/lib/formatters";
import { Clock, Compass, Gauge, Mountain } from "lucide-react";
import { Activity } from "@/types";

interface ActivityKinematicsCardsProps {
  activity: Activity;
  isRun: boolean;
  paceStr: string;
  speedKmhStr: string;
  maxSpeedStr: string;
  pauseSeconds: number;
  movingRatio: number;
}

export function ActivityKinematicsCards({
  activity,
  isRun,
  paceStr,
  speedKmhStr,
  maxSpeedStr,
  pauseSeconds,
  movingRatio,
}: ActivityKinematicsCardsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9BA3AF]">
        <Gauge className="w-4 h-4 text-[#00F0FF]" />
        <span>Kinematic Performance & Velocity</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pace & Velocity */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">
              {isRun ? "Average Pace" : "Average Velocity"}
            </span>
            <Gauge className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {isRun ? paceStr : speedKmhStr}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Max Speed:</span>
              <span className="text-white font-tabular">{maxSpeedStr}</span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Speed in m/s:</span>
              <span className="font-tabular">
                {activity.average_speed_mps.toFixed(2)} m/s
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Distance */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">Total Distance</span>
            <Compass className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {formatDistance(activity.distance_meters)}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Exact Meters:</span>
              <span className="text-white font-tabular">
                {Math.round(activity.distance_meters).toLocaleString()} m
              </span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Miles:</span>
              <span className="font-tabular">
                {(activity.distance_meters * 0.000621371).toFixed(2)} mi
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Duration & Time Efficiency */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">Moving Time</span>
            <Clock className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {formatDuration(activity.moving_time_seconds)}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Elapsed Time:</span>
              <span className="text-white font-tabular">
                {formatDuration(activity.elapsed_time_seconds)}
              </span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Pause / Rest:</span>
              <span className="font-tabular">
                {formatDuration(pauseSeconds)} ({movingRatio}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Elevation & Ascent */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">Elevation Gain</span>
            <Mountain className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {formatElevation(activity.elevation_gain_meters)}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Climb Grade:</span>
              <span className="text-white font-tabular">
                {activity.distance_meters > 0
                  ? (
                      (activity.elevation_gain_meters /
                        activity.distance_meters) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Feet Gained:</span>
              <span className="font-tabular">
                {Math.round(activity.elevation_gain_meters * 3.28084)} ft
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

