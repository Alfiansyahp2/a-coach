import React from "react";
import {
  formatHeartRate,
  formatCadence,
  formatPower,
  formatCalories,
} from "@/lib/formatters";
import { Flame, Heart, RotateCcw, Zap } from "lucide-react";
import { Activity } from "@/types";

interface ActivityBiometricsCardsProps {
  activity: Activity;
  user: any;
  isRun: boolean;
}

export function ActivityBiometricsCards({
  activity,
  user,
  isRun,
}: ActivityBiometricsCardsProps) {
  return (
    <section className="space-y-4 font-mono">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        <Heart className="w-4 h-4 text-[var(--color-alert-red)]" />
        <span>Biometrics, Cadence &amp; Energy Expenditure</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 5: Heart Rate */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">Average Heart Rate</span>
            <Heart className="w-4 h-4 text-[var(--color-alert-red)]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono font-tabular text-[var(--color-text-primary)] tracking-tight">
              {formatHeartRate(activity.average_heartrate)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Max Heart Rate:</span>
              <span className="text-[var(--color-alert-red)] font-tabular font-bold">
                {formatHeartRate(activity.max_heartrate)}
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Resting HR Baseline:</span>
              <span className="text-[var(--color-alert-red)] font-tabular font-semibold">
                {user?.resting_heart_rate || 68} bpm
              </span>
            </div>
          </div>
        </div>

        {/* Card 6: Cadence */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">Cadence</span>
            <RotateCcw className="w-4 h-4 text-[var(--color-cycling)]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono font-tabular text-[var(--color-text-primary)] tracking-tight">
              {formatCadence(activity.average_cadence, activity.sport_type)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Metric Type:</span>
              <span className="text-[var(--color-text-primary)]">
                {isRun ? "Strides / Min (spm)" : "Pedal Revs / Min (rpm)"}
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Rhythm Quality:</span>
              <span className="text-[var(--color-cycling)] font-semibold">Optimal Cadence</span>
            </div>
          </div>
        </div>

        {/* Card 7: Power / Watts */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">Mechanical Power</span>
            <Zap className="w-4 h-4 text-[var(--color-cycling)]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono font-tabular text-[var(--color-text-primary)] tracking-tight">
              {formatPower(activity.average_watts)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Energy Workload:</span>
              <span className="text-[var(--color-text-primary)] font-tabular font-bold">
                {activity.average_watts
                  ? `${Math.round(
                      (activity.average_watts * activity.moving_time_seconds) /
                        1000
                    )} kJ`
                  : "Estimated"}
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Power Metric:</span>
              <span className="font-tabular">
                {activity.average_watts ? "Direct Power / Sensor" : "Estimated Aerobic"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 8: Caloric Expenditure */}
        <div className="p-5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-secondary)] text-xs">
            <span className="font-mono uppercase font-semibold">Caloric Burn</span>
            <Flame className="w-4 h-4 text-[var(--color-running)]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-mono font-tabular text-[var(--color-text-primary)] tracking-tight">
              {formatCalories(activity.calories)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
              <span>Expenditure Rate:</span>
              <span className="text-[var(--color-running)] font-tabular font-bold">
                {activity.calories && activity.moving_time_seconds > 0
                  ? `${Math.round((activity.calories / (activity.moving_time_seconds / 3600)))} kcal/h`
                  : "--"}
              </span>
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] font-mono flex items-center justify-between">
              <span>Energy Substrate:</span>
              <span className="font-tabular font-semibold text-[var(--color-cycling)]">
                Zone 2 Fat Oxidation
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
