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
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9BA3AF]">
        <Heart className="w-4 h-4 text-[#f43f5e]" />
        <span>Biometrics, Cadence & Energy Expenditure</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 5: Heart Rate */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">Average Heart Rate</span>
            <Heart className="w-4 h-4 text-[#f43f5e]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {formatHeartRate(activity.average_heartrate)}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Max Heart Rate:</span>
              <span className="text-[#f43f5e] font-tabular">
                {formatHeartRate(activity.max_heartrate)}
              </span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Resting HR Baseline:</span>
              <span className="text-[#f43f5e] font-tabular font-semibold">
                {user?.resting_heart_rate || 68} bpm (Karvonen)
              </span>
            </div>
          </div>
        </div>

        {/* Card 6: Cadence */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">Cadence</span>
            <RotateCcw className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {formatCadence(activity.average_cadence, activity.sport_type)}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Metric Type:</span>
              <span className="text-white">
                {isRun ? "Strides Per Min (spm)" : "Pedal Revs / Min (rpm)"}
              </span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Rhythm Quality:</span>
              <span className="text-[#10b981]">Optimal Cadence</span>
            </div>
          </div>
        </div>

        {/* Card 7: Power / Watts */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">Mechanical Power</span>
            <Zap className="w-4 h-4 text-[#D4FF00]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {formatPower(activity.average_watts)}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Energy Workload:</span>
              <span className="text-white font-tabular">
                {activity.average_watts
                  ? `${Math.round(
                      (activity.average_watts * activity.moving_time_seconds) /
                        1000
                    )} kJ`
                  : "Estimated"}
              </span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Power Metric:</span>
              <span className="text-white">
                {activity.average_watts
                  ? "Direct Sensor Output"
                  : "Aerobic Estimation"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 8: Calories */}
        <div className="p-5 rounded-sm bg-[#12151D] border border-[#1F2430] space-y-3">
          <div className="flex items-center justify-between text-[#9BA3AF] text-xs">
            <span className="font-mono uppercase">Energy Burned</span>
            <Flame className="w-4 h-4 text-[#FC4C02]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black font-mono font-tabular text-white tracking-tight">
              {formatCalories(activity.calories)}
            </div>
            <div className="text-xs text-[#9BA3AF] font-mono flex items-center justify-between pt-1 border-t border-[#1F2430]/80">
              <span>Hourly Burn Rate:</span>
              <span className="text-white font-tabular">
                {activity.moving_time_seconds > 0 && activity.calories
                  ? `${Math.round(
                      (activity.calories / activity.moving_time_seconds) * 3600
                    )} kcal/h`
                  : "--"}
              </span>
            </div>
            <div className="text-[11px] text-[#5A6272] font-mono flex items-center justify-between">
              <span>Metabolic Fuel:</span>
              <span className="text-white">Carbohydrate / Fat Glycogen</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

