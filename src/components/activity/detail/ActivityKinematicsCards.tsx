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
    <section className="space-y-4 font-mono">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        <Gauge className="w-4 h-4 text-[var(--color-cycling)]" />
        <span>Kinematic Performance &amp; Velocity</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pace & Velocity */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">
              {isRun ? "Average Pace" : "Average Velocity"}
            </span>
            <Gauge className="w-4 h-4 text-[var(--color-cycling)]" />
          </div>
          <div className="space-y-1">
            <div className={`text-3xl font-bold font-mono font-tabular tracking-tight ${
              isRun ? "text-[var(--color-running)]" : "text-[var(--color-cycling)]"
            }`}>
              {isRun ? paceStr : speedKmhStr}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Max Speed:</span>
              <span className="text-[var(--color-text-primary)] font-tabular font-bold">{maxSpeedStr}</span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Speed in m/s:</span>
              <span className="font-tabular font-bold">
                {activity.average_speed_mps.toFixed(2)} m/s
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Distance */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">Total Distance</span>
            <Compass className="w-4 h-4 text-[var(--color-cycling)]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono font-tabular text-[var(--color-text-primary)] tracking-tight">
              {formatDistance(activity.distance_meters)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Exact Meters:</span>
              <span className="text-[var(--color-text-primary)] font-tabular font-bold">
                {Math.round(activity.distance_meters).toLocaleString()} m
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Miles:</span>
              <span className="font-tabular font-bold">
                {(activity.distance_meters * 0.000621371).toFixed(2)} mi
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Duration & Time Efficiency */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">Moving Time</span>
            <Clock className="w-4 h-4 text-[var(--color-cycling)]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono font-tabular text-[var(--color-text-primary)] tracking-tight">
              {formatDuration(activity.moving_time_seconds)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Elapsed Total:</span>
              <span className="text-[var(--color-text-primary)] font-tabular font-bold">
                {formatDuration(activity.elapsed_time_seconds)}
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Movement Efficiency:</span>
              <span className="font-tabular font-bold text-[var(--color-cycling)]">
                {movingRatio.toFixed(1)}% Active
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Elevation Gain */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">Elevation Gain</span>
            <Mountain className="w-4 h-4 text-[var(--color-running)]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono font-tabular text-[var(--color-text-primary)] tracking-tight">
              {formatElevation(activity.elevation_gain_meters)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Vertical Climb:</span>
              <span className="text-[var(--color-running)] font-tabular font-bold">
                ▲ {Math.round(activity.elevation_gain_meters)} m
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Grade Impact:</span>
              <span className="font-tabular font-bold">
                {activity.distance_meters > 0
                  ? `${((activity.elevation_gain_meters / activity.distance_meters) * 100).toFixed(1)}% avg`
                  : "Flat"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
