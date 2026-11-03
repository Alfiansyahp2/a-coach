import React from "react";
import { Layers } from "lucide-react";

interface ActivityPlanMatchCardProps {
  match: any | null;
}

export function ActivityPlanMatchCard({ match }: ActivityPlanMatchCardProps) {
  return (
    <section className="bg-[#12151D] border border-[#1F2430] rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1F2430]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-sm font-semibold text-white">
            Calendar Training Reconciliation (Planned vs Actual)
          </h3>
        </div>
        <span className="text-xs font-mono text-[#9BA3AF]">
          Status:{" "}
          {match ? (
            <span className="text-[#10b981] font-semibold">
              Matched with Workout
            </span>
          ) : (
            <span className="text-[#9BA3AF]">Unscheduled / Free Training</span>
          )}
        </span>
      </div>

      {match ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5">
            <div className="text-[#9BA3AF]">Completion Adherence</div>
            <div className="text-xl font-bold font-tabular text-[#10b981]">
              {match.completion_percentage}%
            </div>
            <div className="text-[11px] text-[#5A6272]">
              Target planned vs actual distance executed
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5">
            <div className="text-[#9BA3AF]">Distance Delta</div>
            <div
              className={`text-xl font-bold font-tabular ${
                match.distance_delta_meters >= 0
                  ? "text-[#10b981]"
                  : "text-[#f43f5e]"
              }`}
            >
              {match.distance_delta_meters >= 0 ? "+" : ""}
              {(match.distance_delta_meters / 1000).toFixed(2)} km
            </div>
            <div className="text-[11px] text-[#5A6272]">
              Variance against target workout mileage
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] space-y-1.5">
            <div className="text-[#9BA3AF]">Pace Delta</div>
            <div
              className={`text-xl font-bold font-tabular ${
                match.pace_delta_seconds_per_km <= 0
                  ? "text-[#10b981]"
                  : "text-[#f59e0b]"
              }`}
            >
              {match.pace_delta_seconds_per_km > 0 ? "+" : ""}
              {match.pace_delta_seconds_per_km}s /km
            </div>
            <div className="text-[11px] text-[#5A6272]">
              {match.pace_delta_seconds_per_km <= 0
                ? "Ahead of planned threshold pace"
                : "Slightly conservative vs planned pace"}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-sm bg-[#161922] border border-[#1F2430] text-xs text-[#9BA3AF] flex items-center justify-between">
          <span>
            This endurance session was recorded as an independent workout. It
            contributes fully to weekly volume and ACWR workload metrics.
          </span>
          <span className="px-2 py-1 rounded bg-[#1A1E28] text-white font-mono text-[10px]">
            Valid Workout
          </span>
        </div>
      )}
    </section>
  );
}

